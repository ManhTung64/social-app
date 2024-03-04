import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AuthController & PostController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  const validToken:string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI0IiwidXNlcm5hbWUiOiJtYW5odHVuZzk5Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDY4MDk2NTIsImV4cCI6MTcwOTQwMTY1Mn0.8kCrYw5vUTnRMyzgm5h-kT1p2hmRWrPFaEPYimamLOo'
  
  it('getall', async() => {
    return await request(app.getHttpServer())
      .get('/api/auth/user/getall')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body).toBeDefined()
      })
  });

  it('create new ', async() => {
    return await request(app.getHttpServer())
      .post('/api/auth/user/addnew')
      .send({username:'abccd',password:'agsfdgfhg'})
      .expect(200)
  });
  it('login ', async() => {
    return await request(app.getHttpServer())
      .post('/api/auth/user/login')
      .send({username:'abccd',password:'agsfdgfhg'})
      .expect(200)
  });
  it('get profile', async() => {
    return await request(app.getHttpServer())
      .get('/api/profile/getonewithprofile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body).toBeDefined()
      })
  });
  it('get all post', async() => {
    return await request(app.getHttpServer())
      .get('/api/post/getall')
      .expect(404)
  });
  
})

