import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { convertHourStrinToMinutes } from './utils/convert-hour-string-to-minutes';
import { convertMinutesStrinToHours } from './utils/convert-minute-string-to-hour';


const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.get('/games', async (request, response)=>{
    const games = await prisma.game.findMany({
        include: {
            _count:{
                select:{
                    ads: true,
                }
            }
        }
    });
    return response.json(games);
})

app.post('/games/:id/ads', async (request, response)=>{
    const gameId = request.params.id;
    const body = request.body

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(`,`),
            hoursStart: convertHourStrinToMinutes(body.hoursStart),
            hoursEnd: convertHourStrinToMinutes(body.hoursEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })

    return response.status(201).json(ad);
})

app.get('/games/:id/ads', async (request, response)=>{
   const gameId = request.params.id;

   const ads = await prisma.ad.findMany({
    select:{
        id: true,
        name:true,
        weekDays:true,
        useVoiceChannel:true,
        yearsPlaying:true,
        hoursStart:true,
        hoursEnd:true,
    },
    where: {
        gameId
    },
    orderBy:{
        createdAt: 'desc',
    }
   })

   return response.json(ads.map(ad=>{
    return{
        ...ad,
        weekDays: ad.weekDays.split(','),
        hoursStart: convertMinutesStrinToHours(ad.hoursStart),
        hoursEnd: convertMinutesStrinToHours(ad.hoursEnd),
    }
   }));
});

app.get('/ads/:id/discord', async (request, response)=>{
    const aId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where:{
            id : aId
        }
    })
    return response.json({discord: ad.discord})
 });

const port = 3333;

app.listen(port, ()=>{
    console.log(`Sv rodando na porta ${port}`);
}) 