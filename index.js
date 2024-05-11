require('dotenv').config();

const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

bot.api.setMyCommands([
    { command: 'start', description: 'Start bot'},
    { command: 'say_hello', description: 'Receive hi'},
]);

bot.command('start', async (ctx) => 
{
    await ctx.reply('Hello');
});

bot.command('inline_keyboard', async (ctx) => 
    {
        const inline = new InlineKeyboard()
        .text('1', 'button-1')
        .text('2', 'button-2')
        .text('3', 'button-3');

        await ctx.reply("Choose number", { reply_markup: inline });
    });

// bot.callbackQuery(['button-1', 'button-2', 'button-3'], async (ctx) => {
//     await ctx.answerCallbackQuery();
//     await ctx.reply('Number');
// }) 
// bot.on('callback_query:data', async (ctx) => {
//     await ctx.answerCallbackQuery();
//     await ctx.reply(`You pressed ${ctx.callbackQuery.data}`);
// });
    

// pasre mode HTML
bot.command(['say_hello', 'hello', 'say_hi'], async (ctx) => 
{
    await ctx.reply('Hello', { reply_parameters: { message_id: ctx.msg.message_id }});
    
});

bot.command('mood', async (ctx) => 
    {
        //const moodKeybord = new Keyboard().text('Good').row().text('Norm').row().text('bad').resized().oneTime();
        
        const moodLabels = ['Good', 'Norm', 'Bad'];
        const rows = moodLabels.map((label) => { return [Keyboard.text(label)]})
        
        const moodKeybord = Keyboard.from(rows).resized();

        await ctx.reply('Your mood?', { reply_markup: moodKeybord});
    });

const menuKeyboard = new InlineKeyboard()
.text('Order status', 'order-status')
.text('Support', 'support');

const backKeyboard = new InlineKeyboard().text('< Back to menu', 'back')

bot.command('menu', async (ctx) => {
    await ctx.reply('Choose menu', { reply_markup: menuKeyboard })
});

bot.callbackQuery('order-status', async (ctx) => {
    await ctx.callbackQuery.message.editText('Status:', {reply_markup: backKeyboard});
    await ctx.answerCallbackQuery();
})

bot.callbackQuery('support', async (ctx) => {
    await ctx.callbackQuery.message.editText('Write your query', {reply_markup: backKeyboard});
    await ctx.answerCallbackQuery();
})

bot.callbackQuery('back', async (ctx) => {
    await ctx.callbackQuery.message.editText('Choose menu', {reply_markup: menuKeyboard});
    await ctx.answerCallbackQuery();
})

bot.hears('ping', async (ctx) => 
{
    console.log(ctx.from);
    await ctx.reply("pong");
}
);

// bot.on('message', async (ctx) => 
// {
//     await ctx.reply('Need to think...')
// })

bot.catch((err) => 
{
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}`);
    const e = err.error;

    if(e instanceof GrammyError)
    {
        console.error("Error in request", e.description);
    }
    else if (e instanceof HttpError)
    {
        console.error("Could not contact telegram:", e);
    }
    else
    {
        console.error("Unknown error:", e);
    }
});

bot.start();