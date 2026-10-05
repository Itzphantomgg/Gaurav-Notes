# 📚 Gaurav Notes - Study & Question Bank Website

A fast, responsive, and minimalist web app to refer to study notes with direct **Q.1, Q.2, Q.3...** navigation, markdown support, search, and instant **GitHub Pages** hosting.

---

## 🚀 Live Demo & GitHub Pages Setup (2 Minutes)

This project has **zero build steps** and **zero dependencies**. It can be deployed directly to GitHub Pages:

### Step-by-Step Instructions:
1. **Initialize & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Notes website"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** (gear icon) &rarr; **Pages** (in the left sidebar).
   - Under **Build and deployment**:
     - **Source**: Select `Deploy from a branch`.
     - **Branch**: Select `main` and `/ (root)`.
   - Click **Save**.

3. **Done!**
   - In 1 to 2 minutes, your website will be live at:
     `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>/`

---

## 📝 How to Add or Edit Questions

All your subject questions and answers are stored in [`questions.js`](./questions.js).

### Example Structure:
Open `questions.js` and add or edit entries in the `questions` array:

```javascript
{
  id: 6,
  badge: "Q.6",
  title: "What is Virtual Memory and Paging?",
  category: "Operating Systems",
  tag: "Important",
  answer: `### Virtual Memory
Virtual memory is a memory management technique...

#### Key Concepts:
- **Pages**: Fixed-size blocks of virtual memory.
- **Frames**: Fixed-size blocks of physical memory (RAM).
- **Page Table**: Maps pages to frames.
`
}
```

### Supported Markdown in Notes:
- Headings (`#`, `##`, `###`)
- Bold and Italic (`**text**`, `*text*`)
- Bullet and numbered lists (`-`, `1.`)
- Code snippets with syntax highlighting (` ```sql `, ` ```python `, etc.)
- Tables
- Blockquotes (`> Note: ...`)

---

## ✨ Features Included

- ⚡ **Q.1, Q.2, Q.3 Navigation**: Instant pill tabs on top and in the sidebar to jump directly to any question.
- 🔗 **Direct Question Links**: Every question updates the URL (e.g., `#q1`, `#q2`), allowing you to share specific questions directly with friends or classmates.
- 🔍 **Instant Search**: Search through question titles, categories, and content. (Press `/` anytime to focus the search bar).
- 🏷️ **Category Filter**: Easily filter questions by topic or unit.
- 🌓 **Dark & Light Mode**: Clean, distraction-free aesthetic with automatic theme saving.
- 📱 **Mobile Responsive**: Clean drawer sidebar and touch-friendly pills for studying on phones and tablets.
- ⌨️ **Keyboard Navigation**: Press <kbd>←</kbd> for Previous Question and <kbd>→</kbd> for Next Question.
- ✅ **Progress Tracker**: Check off questions you've mastered; progress is saved automatically in your browser.
- 🖨️ **Print Friendly**: Clean, distraction-free print stylesheet to print or save notes as PDF.

---

## 💻 Local Preview

Simply double-click [`index.html`](./index.html) to open it in Chrome, Edge, Firefox, or Safari, or run:

```bash
# Python 3
python -m http.server 8000

# or Node.js npx
npx serve
```
Then visit `http://localhost:8000`.
