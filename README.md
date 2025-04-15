# Customer.io Language Tester

An automated testing tool for Customer.io's multi-language email templates. This script automates the process of sending test emails for all language variants of a template.

## 🚀 Features

- Automatically detects and processes all language variants
- Handles both visible tabs and dropdown menu languages
- Provides detailed execution logs with timing information
- Generates a comprehensive summary of test results
- Graceful error handling and fallback mechanisms

## 📋 Prerequisites

- A modern web browser (Chrome recommended)
- Access to Customer.io's template editor
- The template should be open in the editor

## 🛠️ Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/customerio-language-tester.git
   ```

2. Navigate to the project directory:
   ```bash
   cd customerio-language-tester
   ```

## 💻 Usage

1. Open your Customer.io template in the editor
2. Open the browser's Developer Tools (F12 or right-click -> Inspect)
3. Navigate to the Console tab
4. Copy the contents of `src/automate.js`
5. Paste into the console and press Enter

## 📊 Output

The script provides detailed logging with:
- Start and end times
- Number of languages processed
- Success/failure status for each language
- Processing time per language
- Overall execution statistics

Example output:
```
🚀 Starting Language Test Automation...
⏱️  Start Time: 14:30:45

📋 Dropdown detected! Opening to access all languages...
✅ Dropdown opened successfully
📚 Found 32 total languages in dropdown
🔽 Dropdown closed

[... processing logs ...]

📊 ====== Test Send Summary ======
⏱️  End Time: 14:35:20
⏱️  Total Duration: 4.5s

📈 Statistics:
📚 Total Languages Processed: 32
✅ Successful: 30
❌ Failed: 2
⏱️  Average Time per Language: 0.14s
```

## 🔍 How It Works

1. **Initialization**
   - Checks for the presence of a language dropdown
   - Determines the source of language tabs (dropdown or visible)

2. **Language Collection**
   - If dropdown exists: Opens it and collects all language tabs
   - If no dropdown: Uses visible language tabs
   - Falls back to visible tabs if dropdown access fails

3. **Processing**
   - Iterates through each language tab
   - Clicks the tab to switch to that language
   - Waits for the "Send test" button to become enabled
   - Clicks the button and handles the test modal
   - Records success/failure and timing information

4. **Summary Generation**
   - Compiles results for all processed languages
   - Calculates success rates and timing statistics
   - Presents a formatted summary table

## ⚠️ Error Handling

The script includes robust error handling for:
- Missing dropdown elements
- Failed dropdown operations
- Missing or disabled buttons
- Modal interaction failures
- Stale DOM elements

## 🔄 Fallback Mechanisms

- Automatically falls back to visible tabs if dropdown access fails
- Continues processing remaining languages if one fails
- Attempts to close modals even if send operation fails

## 📝 Notes

- The script assumes the template editor is in a ready state
- Processing time may vary based on network conditions and UI responsiveness
- Some errors may be expected if the UI is in an unexpected state

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 