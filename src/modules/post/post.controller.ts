import { PaginationParams } from '@/common/dto/common.dto';
import { customFileName } from '@/common/helper/upload.helper';
import { buildQueryFilter } from '@/common/helper/utils.helper';
import { JwtAuthGuard } from '@/guards/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('media', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: customFileName,
      }),
    }),
  )
  async create(
    @Req() req: Request & any,
    @UploadedFile() file: any,
    @Body()
    body: any,
  ) {
    const media = {
      path: file.path,
      name: file.filename,
    };
    const res = await this.postService.create(req.user.id, body, media);
    return res;
  }

  @Get()
  async getAll(@Query() _query: PaginationParams) {
    const { filter, query } = buildQueryFilter(_query);
    const res = await this.postService.getAll(query, filter);
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Req() req: Request & any, @Param('id') id: string) {
    await this.postService.delete(req.user.id, id);
  }
}
