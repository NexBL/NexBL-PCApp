# Scrapped NexBL PC App

Welcome to the **Scrapped NexBL PC App** – a free and flexible platform for hosting and customizing your own bots!

This app allows you to:

- 🧠 Host as many bots as you'd like — for **free**
- 🎨 Fully customize bot cosmetics
- 💻 View and edit each bot's code in real-time

Whether you're a developer, modder, or just curious, this tool provides all you need to experiment with and deploy bots on your local machine.

---

## 🚀 Getting Started

### Requirements

- **Node.js** (Download it from [nodejs.org](https://nodejs.org))

> ⚠️ Make sure Node.js is installed and added to your system path.

---

### Installation Steps

Follow these steps to get everything set up:

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/NexBL/NexBL-PCApp.git
   cd NexBL-PCApp
   ```

2. **Install Bot Logic dependencies**
   ```bash
   cd BotLogic
   npm install
   ```

3. **Install UI dependencies**
   ```bash
   cd ..
   cd UI
   npm install
   ```

4. **Run the app**
   - While in the `UI` folder, run:
     ```
     start.bat
     ```

---

## 📁 Project Structure

```plaintext
NexBL-PCApp/
├── BotLogic/       # Core logic and behavior of the bots
├── UI/             # Frontend interface for managing and customizing bots
└── README.md       # You're here!
```

---

## 🛠 Features

- 🔄 Real-time bot code editing
- 💾 Local hosting – no cloud or external hosting needed
- 👕 Cosmetic customization support (skins, names, effects)
- 🧩 Modular structure – easily extend bot logic

---

## 📌 Notes

- This project is intended for **local use only**.
- For best results, use the latest LTS version of Node.js.
- You may need to allow the `start.bat` file to run if prompted by antivirus or security settings.

---

## 💬 Feedback

If you run into issues or have suggestions, feel free to open an issue or start a discussion in the repository!
