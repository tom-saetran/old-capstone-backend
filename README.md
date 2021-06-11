# capstone-backend

Backend for my Strive Capstone Project

┌─────────┬──────────────────────────────────────┬─────────────────────────────────────────────┬─────────────────────────────────────┐
│ (index) │                 path                 │                   methods                   │             middleware              │
├─────────┼──────────────────────────────────────┼─────────────────────────────────────────────┼─────────────────────────────────────┤
│    0    │                 '/'                  │                  [ 'GET' ]                  │           [ 'anonymous' ]           │
│    1    │             '/#########'             │                 [ 'POST' ]                  │           [ 'anonymous' ]           │
│    2    │               '/users'               │              [ 'GET', 'POST' ]              │           [ 'anonymous' ]           │
│    3    │            '/users/asCSV'            │                  [ 'GET' ]                  │           [ 'anonymous' ]           │
│    4    │             '/users/:id'             │         [ 'GET', 'PUT', 'DELETE' ]          │           [ 'anonymous' ]           │
│    5    │          '/users/updateDB'           │                 [ 'POST' ]                  │           [ 'anonymous' ]           │
│    6    │         '/users/:id/avatar'          │                 [ 'POST' ]                  │ [ 'multerMiddleware', 'anonymous' ] │
│    7    │          '/users/:id/asPDF'          │                  [ 'GET' ]                  │           [ 'anonymous' ]           │
│    8    │    '/users/:id/purchaseHistory/'     │              [ 'POST', 'GET' ]              │           [ 'anonymous' ]           │
│    9    │ '/users/:id/purchaseHistory/:bookId' │         [ 'GET', 'DELETE', 'PUT' ]          │           [ 'anonymous' ]           │
│   10    │               '/blogs'               │              [ 'GET', 'POST' ]              │           [ 'anonymous' ]           │
│   11    │             '/blogs/:id'             │ [ 'GET', 'PUT', 'DELETE', ... 1 more item ] │           [ 'anonymous' ]           │
│   12    │          '/blogs/:id/cover'          │                 [ 'POST' ]                  │ [ 'multerMiddleware', 'anonymous' ] │
│   13    │          '/blogs/:id/asPDF'          │                  [ 'GET' ]                  │           [ 'anonymous' ]           │
│   14    │          '/blogs/:id/like'           │                 [ 'POST' ]                  │           [ 'anonymous' ]           │
│   15    │         '/blogs/:id/unlike'          │                 [ 'POST' ]                  │           [ 'anonymous' ]           │
│   16    │        '/blogs/:id/comments/'        │                  [ 'GET' ]                  │           [ 'anonymous' ]           │
│   17    │   '/blogs/:id/comments/:commentId'   │                  [ 'GET' ]                  │           [ 'anonymous' ]           │
│   18    │   '/blogs/:id/comment/:commentId'    │             [ 'DELETE', 'PUT' ]             │           [ 'anonymous' ]           │
│   19    │                '/ads'                │              [ 'GET', 'POST' ]              │           [ 'anonymous' ]           │
│   20    │             '/ads/some'              │                  [ 'GET' ]                  │           [ 'anonymous' ]           │
│   21    │              '/ads/:id'              │         [ 'GET', 'PUT', 'DELETE' ]          │           [ 'anonymous' ]           │
└─────────┴──────────────────────────────────────┴─────────────────────────────────────────────┴─────────────────────────────────────┘
server is running on port:  420
