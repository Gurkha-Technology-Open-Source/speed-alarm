# Speed Alarm

A web-based speedometer application that tracks your speed in real-time and alerts you when you exceed a user-defined speed limit. This app is designed to be simple, intuitive, and accessible from any modern web browser with GPS capabilities.

**This is an open source project by [Gurkha Technology](https://www.gurkhatech.com/)**, a leading technology company committed to developing innovative software solutions and fostering open source contributions.

## Features

- **Real-time Speed Tracking:** Utilizes the device's GPS to accurately calculate and display your current speed.
- **Customizable Speed Limit:** Set a speed threshold, and the app will notify you when you exceed it.
- **Audible and Vibrating Alerts:** Plays an alarm and vibrates your device to ensure you're aware of exceeding the speed limit.
- **Offline Functionality:** Thanks to its service worker, the app can be used even without an internet connection.
- **User-friendly Interface:** A clean and straightforward design that's easy to navigate.

## Demo

Try the live demo: [Speed Alarm App](https://gurkhatechnology.github.io/speed-alarm/) (Coming Soon)

## How to Use

1. **Open the App:** Simply open the `index.html` file in a web browser or visit the live demo.
2. **Allow Location Access:** Grant permission for the app to access your device's GPS location.
3. **Set the Speed Limit:** Adjust the speed threshold to your desired limit using the input field.
4. **Start Moving:** The app will automatically track your speed and display it in real-time.
5. **Get Alerts:** If you exceed the set speed limit, the app will play an alarm and vibrate your device.

## Installation

### For Development or Local Use

1. Clone the repository:
   ```bash
   git clone https://github.com/GurkhaTechnology/speed-alarm.git
   cd speed-alarm
   ```

2. Open `index.html` in your web browser:
   ```bash
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   
   # On Windows
   start index.html
   ```

### For Web Hosting

Simply upload all files to your web server. The app will work on any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

## Browser Compatibility

This application requires:
- A modern web browser with support for the Geolocation API
- GPS or location services enabled on your device
- HTTPS connection (required for geolocation in modern browsers)

**Tested Browsers:**
- Chrome/Edge 50+
- Firefox 45+
- Safari 10+
- Mobile browsers on iOS and Android

## Technical Details

- **Frontend:** Built with HTML, CSS, and JavaScript.
- **GPS Integration:** Uses the browser's Geolocation API to track the device's position and calculate speed.
- **Speed Calculation:** Implements the Haversine formula for accurate distance calculation between GPS coordinates.
- **Offline Support:** Implemented with a service worker to cache app assets and enable offline use.
- **Dependencies:** None, this is a vanilla JavaScript application with no external dependencies.
- **UI Framework:** Uses Bootstrap 4.5.2 for responsive design.

## Project Structure

```
speed-alarm/
├── index.html          # Main HTML file
├── script.js           # Core application logic
├── styles.css          # Custom styles
├── service-worker.js   # Service worker for offline support
├── alarm.mp3           # Default alarm sound
├── LICENSE             # MIT License
├── README.md           # This file
└── plan.md             # Future development plans
```

## Future Enhancements

We have exciting plans for this project! Check out our [plan.md](plan.md) file for details on upcoming features including:
- Persistent settings using localStorage
- Multiple alarm sound options
- PWA installation support
- Trip history and statistics
- Map integration
- Dark mode theme
- And much more!

Want to help implement these features? See our [CONTRIBUTING.md](CONTRIBUTING.md) guide!

## Contributing

We welcome and encourage contributions from the community! Whether you're fixing bugs, adding new features, improving documentation, or suggesting enhancements, your input is valuable.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide to learn how to get started. We also ask that all contributors adhere to our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository
- 📢 Share the project with others

## Security

If you discover a security vulnerability, please review our [SECURITY.md](SECURITY.md) file for instructions on how to report it responsibly.

## About Gurkha Technology

[Gurkha Technology Pvt. Ltd.](https://www.gurkhatech.com/) is a technology company dedicated to creating innovative software solutions and supporting the open source community. We believe in the power of collaboration and sharing knowledge to build better software for everyone.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Gurkha Technology](https://www.gurkhatech.com/)**