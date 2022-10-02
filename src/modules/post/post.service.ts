import { uploadCloud } from '@/common/helper/cloudinary.helper';
import { toPostResponse } from '@/common/helper/utils.helper';
import { AppError } from '@/errors/AppError';
import { Logger } from '@/loaders/logger/loggerLoader';
import { Hashtag, Music, Post } from '@/models';
import { BaseQuery } from '@/types/common';
import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreatePostDto } from './post.dto';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Hashtag) private hashtagRepository: Repository<Hashtag>,
    @InjectRepository(Music) private musicRepository: Repository<Music>,
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
  ) {
    this.usersClient.connect();
  }

  getHashtags(content: string) {
    const regexHashtag = /\B(\#[a-zA-Z]+\b)(?!;)/g;

    const hashtags = content.match(regexHashtag);

    return hashtags.map(async (hashtag) => {
      const hashtagEntity = await this.hashtagRepository.findOneBy({
        content: hashtag,
      });

      if (hashtagEntity) return hashtagEntity;
      else {
        const newHashtag = this.hashtagRepository.create({
          content: hashtag,
        });
        return await this.hashtagRepository.save(newHashtag);
      }
    });
  }

  async createMusic(media: { path: string; name: string }) {
    return new Promise((resolve, reject) => {
      const videoFile = ffmpeg(media.path);
      const nameAudioOutput = media.name.split('.')[0] + '.mp3';
      videoFile
        .output(`uploads/audios/${nameAudioOutput}`)
        .on('end', async () => {
          const result = await uploadCloud(
            `uploads/audios/${nameAudioOutput}`,
            'audios',
            'raw',
          );
          resolve(result);
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
  }

  async uploadVideo(videoPath: string) {
    try {
      const result = await uploadCloud(videoPath, 'videos', 'video');
      return result;
    } catch (error) {
      throw error;
    }
  }

  async applyMusicForVideo(
    videoPath: { path: string; name: string },
    musicPath: string,
  ) {
    const videoPathCopy = `uploads/videos/copy-${videoPath.name}`;
    return new Promise((resolve, reject) => {
      ffmpeg()
        .addInput(videoPath.path)
        .addInput(musicPath)
        .output(videoPathCopy)
        .outputOptions(['-map 0:v', '-map 1:a', '-c:v copy', '-shortest'])
        .on('error', (error) => reject(error))
        .on('end', async () => {
          const result = await this.uploadVideo(videoPathCopy);
          resolve({ result, newVideoPath: videoPathCopy });
        })
        .run();
    });
  }

  async create(
    userId: string,
    body: CreatePostDto,
    mediaPath: { path: string; name: string },
  ) {
    try {
      if (userId !== body.authorId) {
        throw new ForbiddenException(
          'You are not allowed to create a post for another user',
        );
      }

      const user = await firstValueFrom(
        this.usersClient.send('get_user', {
          id: body.authorId,
        }),
      );

      if (!user) {
        throw new AppError('User not found', HttpStatus.NOT_FOUND);
      }

      const hashtags = await Promise.all(this.getHashtags(body.content));

      if (!body.musicId) {
        const data = (await this.createMusic(mediaPath)) as any;
        const dataVideo = (await this.uploadVideo(mediaPath.path)) as any;

        const newMusic = this.musicRepository.create({
          name: `song-${user.name}`,
          song: data.secure_url,
        });

        const musicSaved = await this.musicRepository.save(newMusic);

        const newPost = this.postRepository.create({
          ...body,
          authorId: body.authorId,
          media: dataVideo.secure_url,
          music: musicSaved,
          hashtags: hashtags,
        });

        const postSaved = await this.postRepository.save(newPost);

        fs.unlinkSync(mediaPath.path);
        fs.unlinkSync(
          mediaPath.path.replace('videos', 'audios').replace('.mp4', '.mp3'),
        );

        return {
          data: { ...postSaved, author: user },
        };
      } else {
        const music = await this.musicRepository.findOneBy({
          id: body.musicId,
        });

        if (!music) {
          throw new AppError('Music not found', HttpStatus.NOT_FOUND);
        }

        const { result, newVideoPath } = (await this.applyMusicForVideo(
          mediaPath,
          music.song,
        )) as any;

        const post = this.postRepository.create({
          ...omit(body, ['musicId', 'media']),
          authorId: body.authorId,
          music: music,
          media: result.secure_url,
          hashtags,
        });

        const postSaved = await this.postRepository.save(post);
        fs.unlinkSync(mediaPath.path);
        fs.unlinkSync(newVideoPath);

        this.logger.log('Post created successfully', JSON.stringify(body));

        return {
          data: { ...toPostResponse(postSaved), author: user },
        };
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getAll(query: BaseQuery, filter: any) {
    try {
      const qp = this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.hashtags', 'hashtags')
        .leftJoinAndSelect('post.music', 'music')
        .where(filter);

      if (query.q) {
        qp.andWhere('content LIKE :q', { q: `%${query.q}%` });
      }

      if (query.sort_by) {
        qp.orderBy(query.sort_by, query.sort_order || 'DESC');
      }

      let posts: Array<any> = await qp
        .skip((query.page - 1) * query.per_page)
        .take(query.per_page)
        .getMany();

      posts = await Promise.all(
        posts.map(async (post) => ({
          ...post,
          author: await firstValueFrom(
            this.usersClient.send('get_user', { id: post.authorId }),
          ),
        })),
      );

      const total = await qp.getCount();

      this.logger.log('Get all posts successfully', JSON.stringify(query));

      return {
        items: posts.map((post) => toPostResponse(post)),
        totalCount: total,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getOne(id: string) {
    try {
      const post = await this.postRepository.findOneBy({
        id,
      });

      if (!post) {
        throw new AppError('Post not found', HttpStatus.NOT_FOUND);
      }

      const author = await firstValueFrom(
        this.usersClient.send('get_user', { id: post.authorId }),
      );

      return {
        data: { ...toPostResponse(post), author },
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async delete(reqId: string, postId: string) {
    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      if (!post) {
        throw new AppError('Post not found', HttpStatus.NOT_FOUND);
      }

      // if (post.author.id !== reqId) {
      //   throw new ForbiddenException('You are not allowed to delete this post');
      // }

      await this.postRepository.delete(postId);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
