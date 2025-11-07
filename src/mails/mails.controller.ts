import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailsService } from './mails.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';

@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) { }

  @Post('send')
  async sendMail() {
    const user = 'USER'
    const email = 'joelchoqueflores69@gmail.com';
    //await this.mailsService.sendMail(user, email);
    return { message: 'Mail sent successfully' };
  }


}
