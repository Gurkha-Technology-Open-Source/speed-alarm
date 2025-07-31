# Speed Alarm

A web-based speedometer application that tracks your speed in real-time and alerts you when you exceed a user-defined speed limit. This app is designed to be simple, intuitive, and accessible from any modern web browser with GPS capabilities.

## Features

- **Real-time Speed Tracking:** Utilizes the device's GPS to accurately calculate and display your current speed.
- **Customizable Speed Limit:** Set a speed threshold, and the app will notify you when you exceed it.
- **Audible and Vibrating Alerts:** Plays an alarm and vibrates your device to ensure you're aware of exceeding the speed limit.
- **Offline Functionality:** Thanks to its service worker, the app can be used even without an internet connection.
- **User-friendly Interface:** A clean and straightforward design that's easy to navigate.

## How to Use

1. **Open the App:** Simply open the `index.html` file in a web browser.
2. **Set the Speed Limit:** Adjust the speed threshold to your desired limit using the input field.
3. **Start Moving:** The app will automatically track your speed and display it in real-time.
4. **Get Alerts:** If you exceed the set speed limit, the app will play an alarm and vibrate your device.

## Technical Details

- **Frontend:** Built with HTML, CSS, and JavaScript.
- **GPS Integration:** Uses the browser's Geolocation API to track the device's position and calculate speed.
- **Offline Support:** Implemented with a service worker to cache app assets and enable offline use.
- **Dependencies:** None, this is a vanilla JavaScript application.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.