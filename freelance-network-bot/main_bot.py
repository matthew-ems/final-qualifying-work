from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
import asyncio

token = '7451432407:AAFlgR3dy-cDmSxtjz8dx8a0r_3GT2MDTQw'
web_app_url = 'https://24fn.ru'


async def get_start(message: types.Message, bot: Bot):
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="Open Web App", web_app=types.WebAppInfo(url=f"{web_app_url}?chat_type={message.chat.type}&chat_instance={message.chat.id}"))]
    ])
    await bot.send_message(message.from_user.id, f'Hello {message.from_user.first_name}', reply_markup=keyboard)


async def open_app(message: types.Message, bot: Bot):
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="Open Web App", web_app=types.WebAppInfo(url=f"{web_app_url}?chat_type={message.chat.type}&chat_instance={message.chat.id}"))]
    ])
    await bot.send_message(message.from_user.id, "Click the button below to open the web app:", reply_markup=keyboard)


async def set_bot_commands(bot: Bot):
    commands = [
        types.BotCommand(command="start", description="Start the bot"),
        types.BotCommand(command="app", description="Open the web app")
    ]
    await bot.set_my_commands(commands)


async def start():
    bot = Bot(token=token)
    await set_bot_commands(bot)

    dp = Dispatcher()
    dp.message.register(get_start, Command(commands=["start"]))
    dp.message.register(open_app, Command(commands=["app"]))

    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == '__main__':
    asyncio.run(start())
