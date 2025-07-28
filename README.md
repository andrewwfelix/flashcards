# Flashcard App

A modern, responsive flashcard application built with Node.js, Express.js, and vanilla JavaScript. Perfect for studying and memorizing information across different subjects.

## Features

### 🎯 Core Features
- **Create, Edit, Delete Flashcards**: Full CRUD operations for managing your study materials
- **Study Mode**: Interactive study session with card flipping and progress tracking
- **Search & Filter**: Find flashcards by content or category
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

### 📚 Study Features
- **Card Flipping**: Click to reveal answers during study sessions
- **Progress Tracking**: See your progress through the study deck
- **Difficulty Rating**: Rate cards as Easy, Medium, or Hard (framework ready for spaced repetition)
- **Category Organization**: Organize flashcards by subject (Programming, Geography, History, Science, etc.)

### 🎨 User Experience
- **Real-time Search**: Instant filtering as you type
- **Category Filtering**: Filter by specific subjects
- **Success Notifications**: Visual feedback for all actions
- **Smooth Animations**: Professional feel with CSS transitions
- **Modal Dialogs**: Clean editing interface

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Production

To run in production mode:
```bash
npm start
```

## API Endpoints

The backend provides a RESTful API for flashcard management:

- `GET /api/flashcards` - Get all flashcards
- `GET /api/flashcards/:id` - Get a specific flashcard
- `POST /api/flashcards` - Create a new flashcard
- `PUT /api/flashcards/:id` - Update a flashcard
- `DELETE /api/flashcards/:id` - Delete a flashcard
- `GET /api/flashcards/category/:category` - Get flashcards by category

## Project Structure

```
flashcards/
├── server.js              # Express.js server
├── package.json           # Dependencies and scripts
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styles
│   └── script.js         # Frontend JavaScript
└── README.md             # This file
```

## Usage Guide

### Creating Flashcards
1. Click "Create New" in the navigation
2. Fill in the question and answer fields
3. Select a category and difficulty level
4. Click "Create Flashcard"

### Studying
1. Click "Study Mode" in the navigation
2. Click "Start Study" to begin
3. Read the question and click "Flip Card" to see the answer
4. Rate the difficulty and move to the next card
5. Complete the study session to see your progress

### Managing Flashcards
- **Browse**: View all flashcards with search and filter options
- **Edit**: Click the "Edit" button on any flashcard
- **Delete**: Click the "Delete" button (with confirmation)
- **Search**: Use the search box to find specific content
- **Filter**: Use the category dropdown to filter by subject

## Customization

### Adding New Categories
1. Update the category options in `public/index.html`
2. Add the new category to the filter dropdown
3. Update the create and edit forms

### Styling
The app uses modern CSS with:
- CSS Grid for responsive layouts
- Flexbox for component alignment
- CSS Custom Properties for theming
- Smooth transitions and animations

### Backend Storage
Currently uses in-memory storage. For production, consider:
- SQLite for simple deployments
- PostgreSQL for larger applications
- MongoDB for document-based storage

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with modern features
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Development

### Adding Features
1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Update `script.js` for new functionality
3. **Styling**: Modify `styles.css` for UI changes

### Testing
The app includes sample flashcards for testing:
- Programming concepts (Node.js, Express.js)
- Geography facts
- More can be added through the create interface

## Future Enhancements

Potential improvements for the next version:
- [ ] User authentication and accounts
- [ ] Spaced repetition algorithm
- [ ] Import/export functionality
- [ ] Study statistics and analytics
- [ ] Dark mode theme
- [ ] Offline support with service workers
- [ ] Database integration (SQLite/PostgreSQL)
- [ ] Study reminders and scheduling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

---

**Happy Studying!** 📚✨ 