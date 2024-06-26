// socket-transform.pipe.ts

import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketTransformPipe implements PipeTransform<any, any> {
  async transform(value: Socket, metadata: ArgumentMetadata): Promise<any> {
    try {
      var object = plainToClass(metadata.metatype, value)
      var errors: ValidationError[] = await validate(object);
    } catch (e) {
      console.log(e)
      throw new WsException(e)
    }
    if (errors.length > 0) {
      const errorMessage: string[] = this.buildErrorMessage(errors);
      throw new WsException(errorMessage)
    }
    return object
  }

  private buildErrorMessage(errors: ValidationError[]): string[] {
    let listError: string[] = []
    errors
      .map((error) => {
        listError.push(Object.values(error.constraints).toString())
      })
    return listError
  }
}
