TravelWise – Travel Management System

TravelWise is a travel management system designed to efficiently plan and manage trips.

Note: This project was initially developed collaboratively with a peer as part of a course project. This repository represents my personal version, where I implemented and refined features individually.

TravelWise is a fully normalized travel management system developed to demonstrate strong fundamentals in DBMS design, relational modeling, and analytical SQL querying.
The project models real-world travel planning by allowing users to manage trips, itineraries, expenses, budgets, companions, and city guides in a secure and structured database environment.

Project Context:
This project was initially developed collaboratively as part of an academic DBMS course.
This repository represents my individual implementation, where I structured the database schema, implemented SQL queries, and refined system design independently.

Core Objectives

Apply database normalization principles to eliminate redundancy

Design a robust relational schema using primary–foreign key relationships

Implement meaningful analytical SQL queries for real-world use cases

Ensure data integrity, security, and query efficiency

Key Features

Admin & User Management

Admins can add, update, and remove users

Secure access with role-based privileges and unique email constraints

Trip Management

Users can create and manage trips with:

Itineraries

Transport details

Accommodation records

Expenses and budgets

Expense & Budget Tracking

Tracks planned vs actual expenses

Supports analytical queries for expense summaries and budget analysis

Companion Management

Dedicated Companion table to track people accompanying a trip

Reduces ambiguity in expense sharing by clearly mapping who participated

City Guide Integration

Stores important places and ratings for each travel destination

Database Design Highlights

Fully normalized schema (up to 3NF)

Clear entity–relationship mapping

Enforced referential integrity using foreign keys

Indexed attributes for faster query execution

| Entity             | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| **Admin**          | Manages users                                                 |
| **User**           | Creates trips; managed by an admin                            |
| **Trip**           | Represents a travel plan; belongs to a user                   |
| **Itinerary_Item** | Scheduled activities per day/time                             |
| **Expense**        | Records all trip expenses                                     |
| **Transport**      | Travel arrangements for a trip                                |
| **Accommodation**  | Stay details during the trip                                  |
| **Budget**         | Planned vs actual expense tracking                            |
| **Companion**      | People accompanying the user; enables shared expense tracking |
| **City_Guide**     | Important places and ratings for destinations                 |


STechnologies Used

Database: MySQL

Query Language: SQL

Concepts: Normalization, ER Modeling, Constraints, Indexing

Version Control: Git & GitHub


Installation / Usage

Clone the repository:

git clone https://github.com/AkshithaMuttangi/TravelWise.git


Navigate to the project folder:

cd TravelWise


Run backend server (if applicable):

npm start


Open index.html in your browser to use the app