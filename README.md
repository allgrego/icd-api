# ICD API

A microservice to handle ICD-10-CM data (chapters, blocks, categories and subcategories or diagnostics)

**Author**: _Gregorio Alvarez < allgrego14@gmail.com >_
**Version**: 1.0.0


## Initial Setup

To run the ICD-API locally, clone the repository, install its dependencies and run the following command:
```
npm run build && npm run nodemon lib/server
```

This will, at first, build the JavaScript files in lib directory from TypeScript files on src directory. Then it will run the server with nodemon.

The server will be listening in [http://localhost:3000](http://localhost:3000)

To continuous build, run: 
```
npm run build-watch
```
## Demo

Not yet deployed...

## ICD 10 Structure

This API uses the structure
**_Chapter (I) → Block (A00-A09) → Category (A00) → Subcategory (A00.0)_**

    .                   
    ├── Chapter: I                                # Chapter Parent
    |      ├─── Block: A00-A09                    # Block children
    |      |     ├── Category: A00                # Category children
    |      |     |     ├── Subcategory: A00.0     # Subcategory or Diagnostic
    |      |     |     ├── Subcategory: A00.1     # Subcategory or Diagnostic
    |      |     |     └── ...                    
    |      |     └── ...
    |      └── ...
    └── ...
## Endpoints

- GET /chapters
- GET /chapters/**{chapter ID}**
- GET /chapters/**{chapter ID}**/blocks
- GET /chapters/search/label/**{queryLabel}**
- GET /blocks
- GET /blocks/**{block ID}**
- GET /blocks/**{block ID}**/categories
- GET /blocks/search/id/**{queryId string}**
- GET /blocks/search/label/**{queryLabel string}**
- GET /categories
- GET /categories/**{category ID}**
- GET /categories/**{category ID}**/subcategories
- GET /categories/search/id/**{queryId string}**
- GET /categories/search/label/**{queryLabel string}**