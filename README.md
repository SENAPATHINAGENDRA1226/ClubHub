# ClubHub 🎓

A modern, full-featured **Campus Club & Event Management Platform** for organizing, promoting, and managing student clubs and events with ease.

**Live Demo:** [https://club-hub-frontend-iota.vercel.app](https://club-hub-frontend-iota.vercel.app)

---

## 🌟 Features

- **Club Management** - Create and manage student clubs with detailed profiles
- **Event Organization** - Plan, schedule, and promote campus events
- **QR Code Integration** - Generate and scan QR codes for event check-ins
- **Real-time Analytics** - Track event attendance and club engagement with interactive charts
- **Responsive Design** - Seamless experience across all devices
- **Modern UI/UX** - Beautiful interface with smooth animations and dark mode support
- **User-Friendly Dashboard** - Intuitive management tools for club leaders

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **UI Components:** Lucide React Icons
- **Animations:** Framer Motion
- **Charts:** Recharts
- **QR Code:** html5-qrcode & qrcode.react
- **Notifications:** React Hot Toast
- **Routing:** React Router DOM
- **Linting:** ESLint

---

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SENAPATHINAGENDRA1226/ClubHub.git
   cd ClubHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

---

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with strict rules

---

## 📁 Project Structure

```
ClubHub/
├── src/                    # Source code
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── styles/           # Global styles
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

---

## 🐳 Docker Support

Build and run the application in a Docker container:

```bash
# Build the Docker image
docker build -t clubhub .

# Run the container
docker run -p 80:80 clubhub
```

---

## 📋 Environment Variables

Create a `.env.production` file for production environment:

```env
VITE_API_URL=your_api_endpoint
```

---

## 🌐 Deployment

The project is configured for deployment on **Vercel**:

- Push to the main branch
- Vercel automatically deploys your changes
- View deployment configuration in `vercel.json`

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**SENAPATHI NAGENDRA**
- GitHub: [@SENAPATHINAGENDRA1226](https://github.com/SENAPATHINAGENDRA1226)

---

## 📞 Support

For issues, questions, or feedback, please open an issue on the [GitHub repository](https://github.com/SENAPATHINAGENDRA1226/ClubHub/issues).

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices in mind. Special thanks to all contributors and the open-source community!

---

**Happy Club Managing! 🎉**
