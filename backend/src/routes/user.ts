import { Hono } from 'hono'

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export const userRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string
    }
}>()
userRouter.use("*", async (c,next)=>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    c.set("prisma",prisma);
    await next()
  })
  

userRouter.post('/signup',async (c) => {
    const prisma=c.get('prisma');
    console.log('1st');
    const body=await c.req.json();
    console.log('2nd');
    try{
      const user=await prisma.user.create({
        data:{
          email:body.email,
          password:body.password

        }
        
      });
      console.log('user_created')
   
      const token = await sign({id:user.id},c.env.JWT_SECRET);
      console.log(token)
      return c.json({token})
    }catch(e){
       c.status(403);
       return c.json({"errror in signin route"},e)
    }
});

userRouter.post('/signin',async (c) => {
    const prisma=c.get("prisma")
    const body=await c.req.json();
    try{

      const user=prisma.user.findUnique({
        where:{
          email:body.email,
          password:body.password
        }
      })
      if(!user){
        c.status(403);
        return c.json({error:"user not found"});
      }
      const token =await sign({id:user.id},c.env.JWT_SECRET);
      return c.json({token});

    }catch(e){
      return c.text("error in signin route");
    }
});