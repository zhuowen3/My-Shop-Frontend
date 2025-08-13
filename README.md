# 🛍 My Shop – Frontend
Visit my shop at www.plushiehouse.com!
[![Visit My Shop](https://plushiehouse.com/logo4.png)](https://www.plushiehouse.com)

This is the **frontend** for the My Shop e-commerce platform, built with **Vue 3**, **TypeScript**, and **Vite**.  
It connects to a **FastAPI** backend and allows customers to browse products, view details, add items to the cart, and proceed to checkout.  
An **admin dashboard** is also included for managing products, categories, and orders.

---

## ✨ Features

- **Product browsing** – Search and filter products by category.
- **Product detail pages** – View product description, price, available sizes/styles, and stock.
- **Shopping cart** – Add, update, and remove items; stock is validated before checkout.
- **Checkout flow** – Integrated with **Stripe** for payments.
- **Admin dashboard** – Add, edit, delete products and categories, manage orders.
- **Responsive design** – Mobile-friendly layout.

---

## 🛠 Tech Stack

**Frontend**
- [Vue 3](https://vuejs.org/) with Composition API
- [Vite](https://vite.dev/) for fast builds
- [TypeScript](https://www.typescriptlang.org/)
- [Vue Router](https://router.vuejs.org/)
- [Axios](https://axios-http.com/) for API requests

**Backend** (separate repo)
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/) & SQLite/PostgreSQL
- [Cloudinary](https://cloudinary.com/) for image hosting
- [Stripe](https://stripe.com/) for payments

---

## 📦 Project Setup

Install dependencies:
```sh
npm install
