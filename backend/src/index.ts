import { Hono } from 'hono'

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { userRouter } from './routes/user'
import{decode,sign,verify} from'hono/jwt'


const app = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string
  },
  Variables:{
    userId: string
  }
}>();



app.use('/api/v1/blog/*',async (c,next)=>{
  const jwt=c.req.header('Authorization');
  
  console.log(jwt)
  if(!jwt){
    c.status(401);
    return c.json({
      error:"unauthorized"
    });
  }
  const token=jwt.split(' ')[1];
  console.log( token)
  const payload=await verify(token,c.env.JWT_SECRET)
  if(!payload){
    c.status(401);
    return c.json({error:"unauthorized"});
  }
  c.set('userId',payload.id);
  await next()
})
app.route('/api/v1/user',userRouter)
  
  


export default app
