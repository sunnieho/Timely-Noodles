# Timely-Noodles
Demo website: https://timely-noodles.onrender.com/

Timely Noodles - SIT774 10.4HD Project

Hi, I'm Sunnie. This is my web project for Task 10.4HD.  
I built this site based on my brother’s cold noodle shop. It’s an extension of my Task 10.3D project, now with a login system, admin message view, and CSV download features.

---

[ Technologies Used ]
- Node.js + Express
- SQLite3
- EJS templating
- Bootstrap + Font Awesome
- express-session (for login)

---

[ Main Features ]
1. Users can leave comments and ratings on product pages
2. The Contact Us page allows users to send messages
3. Admin can log in and view Contact Us messages
4. Admin can download all product feedback as a CSV file
5. Each product page uses dynamic routing: `/product/:slug`
6. Star rating display and average rating calculation (with Bootstrap styling)

---

[ Admin Login Info ]
- Username: admin  
- Password: 1234

---

[ How to Run ]
1. Install packages:  
   `npm install`

2. Create the database (will generate `product_feedback` and `contact_messages` tables):  
   `node createDB.js`

3. Start the server:  
   `node index.js`

4. Open your browser and go to:  
   `http://localhost:3000`

---

[ Files ]
- `index.js`: main backend file
- `createDB.js`: creates database tables
- `/views/`: all EJS frontend pages
- `mySurveyDB.sqlite3`: local database file
- `/public_html/`: images and style files
- `login.ejs`, `admin.ejs`: login and admin dashboard
- `product.ejs`: product details + feedback
- `messages.ejs`: confirmation page for contact form

---

[ Notes ]
For this project, I split the feedback into two tables (contact and product).  
I also added a login/logout system. After logging in, employees can view messages from the Contact Us page and download all product feedback in CSV format.

Even though there’s still a lot I want to improve, I feel this project is getting close to a real-world application.

---

Thanks to the teacher and TAs! I learned so much from this unit 🙏
