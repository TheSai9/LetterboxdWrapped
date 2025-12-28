
# CineWrapped: Letterboxd Year in Review

<img width="1668" height="661" alt="Screenshot 2025-12-28 102819" src="https://github.com/user-attachments/assets/a9cc21d4-c660-4a25-89b0-9f7946265e60" />

A cinematic, data-driven storytelling experience that visualizes your Letterboxd movie watching history. Influenced by the "Spotify Wrapped" format and designed with a bold **Bauhaus** aesthetic, this application turns your raw CSV exports into a beautiful, interactive presentation.

## ✨ Features

*   **📊 Volume Analysis**: Visualizes total films watched, hours spent, and the distribution of film eras (decades).
*   **📅 Rhythm & Patterns**: Interactive calendar heatmap showing daily activity, watching streaks, and monthly/weekly breakdowns.
*   **⭐ Critical Analysis**: Deep dive into your rating habits, average scores, and rating distributions.
*   **🏆 Favorites & Rewatches**: Highlights your highest-rated films, rewatch statistics, and "new vs. old" discovery rates.
*   **🎬 A-List Insights**: (Powered by TMDB) Identifies your most-watched actors, directors, and genres through background data enrichment.
*   **🤖 AI Persona**: Generates a witty, personalized "Cinema Persona" based on your specific stats (e.g., "The Dedicated Cinephile").
*   **🎨 Bauhaus Design**: A strict, high-contrast design system using primary colors (Red, Blue, Yellow) and geometric layouts.
*   **🖱️ Interactive Drill-downs**: Click on chart bars, heatmap squares, or stats to reveal a dropdown list of specific movies associated with that data point.

## 📸 Visuals

| Volume Analysis | Rhythm Heatmap |
|:---:|:---:|
| <img width="1317" height="676" alt="Screenshot 2025-12-28 102937" src="https://github.com/user-attachments/assets/dd589eab-7b26-4c4b-ac16-fb0a87ed57e2" /> | <img width="1225" height="691" alt="Screenshot 2025-12-28 103024" src="https://github.com/user-attachments/assets/75ef1262-9bc3-4524-afba-d78d3fe62d60" /> |

| A-List Cast & Crew | Favourite Films |
|:---:|:---:|
| <img width="1356" height="698" alt="Screenshot 2025-12-28 103145" src="https://github.com/user-attachments/assets/c7043ab8-2790-4cbe-b003-d266b1eed9fe" /> | <img width="1361" height="649" alt="Screenshot 2025-12-28 103103" src="https://github.com/user-attachments/assets/d8d68e20-3451-47c9-beb3-3e0b87c7b969" /> |

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Framer Motion (for animations)
*   **Charts**: Recharts
*   **Data Parsing**: Custom CSV Parser (Client-side)
*   **Enrichment API**: The Movie Database (TMDB)
*   **AI Generation**: Google Gemini API

## 🚀 Setup Instructions

### Prerequisites
*   Node.js (v18 or higher)
*   A TMDB API Key (Free)
*   A Google Gemini API Key (Free tier available)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/TheSai9/cinewrapped.git
    cd cinewrapped
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Keys**
    *   **TMDB**: Open `config.ts` and replace the placeholder with your TMDB API Key.
        ```typescript
        export const TMDB_API_KEY = 'your_tmdb_api_key_here';
        ```
    *   **Gemini AI**: Create a `.env` file in the root directory and add your key.
        ```env
        API_KEY=your_google_gemini_api_key
        ```

4.  **Run the application**
    ```bash
    npm start
    ```

## 📂 How to use

1.  **Export your data from Letterboxd**:
    *   Go to Letterboxd Settings > Import & Export.
    *   Click "Export Your Data".
    *   Download and unzip the file.
2.  **Launch CineWrapped**:
    *   Open the app in your browser (usually `http://localhost:3000` or `5173`).
3.  **Upload Files**:
    *   Select `diary.csv` for the main log.
    *   (Optional) Select `ratings.csv` for deeper rating analysis.
4.  **Enjoy**:
    *   Click "Construct Analysis" and navigate through your year in review using the arrows or keyboard.

## 📄 License

MIT