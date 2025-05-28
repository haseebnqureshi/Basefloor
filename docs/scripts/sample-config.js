module.exports = (API) => {
  return {
    // API Name
    name: 'Basefloor Example API',
    
    // Database configuration
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/basefloor-example'
    },
    
    // Authentication configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'example-secret-key-change-in-production'
    },
    
    // CORS configuration
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000'
    },

    // Models configuration
    models: {
      Users: {
        collection: 'user',
        labels: ['User', 'Users'],
        values: {
          _id: ['ObjectId', 'rd'],
          name: ['String', 'cru'],
          email: ['String', 'cru'],
          password: ['String', 'c'],
          role: ['String', 'cru', 'user'],
          avatar: ['String', 'cru'],
          bio: ['String', 'cru'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        },
        filters: {
          create: {
            values: (values) => {
              values.created_at = new Date();
              values.updated_at = new Date();
              return values;
            }
          },
          update: {
            values: (values) => {
              values.updated_at = new Date();
              return values;
            }
          },
          output: (data) => {
            // Remove password from output
            if (data && data.password) {
              delete data.password;
            }
            return data;
          }
        }
      },
      
      Posts: {
        collection: 'post',
        labels: ['Post', 'Posts'],
        values: {
          _id: ['ObjectId', 'rd'],
          title: ['String', 'cru'],
          slug: ['String', 'cru'],
          content: ['String', 'cru'],
          excerpt: ['String', 'cru'],
          featured_image: ['String', 'cru'],
          status: ['String', 'cru', 'draft'], // draft, published, archived
          author_id: ['ObjectId', 'cr'],
          category: ['String', 'cru'],
          tags: ['Array', 'cru'],
          views: ['Number', 'ru', 0],
          likes: ['Number', 'ru', 0],
          published_at: ['Date', 'cru'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        },
        filters: {
          create: {
            values: (values) => {
              values.created_at = new Date();
              values.updated_at = new Date();
              if (!values.slug && values.title) {
                values.slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              }
              return values;
            }
          },
          update: {
            values: (values) => {
              values.updated_at = new Date();
              return values;
            }
          }
        }
      },
      
      Comments: {
        collection: 'comment',
        labels: ['Comment', 'Comments'],
        values: {
          _id: ['ObjectId', 'rd'],
          post_id: ['ObjectId', 'cr'],
          user_id: ['ObjectId', 'cr'],
          content: ['String', 'cru'],
          status: ['String', 'cru', 'pending'], // pending, approved, spam
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      }
    },
    
    // Routes configuration
    routes: {
      // User routes
      "/users(Users)": { 
        c: { allow: true },  // Anyone can create (register)
        rA: { allow: "admin=in=@req_user.role" },  // Only admins can list all users
        r: { allow: true },  // Anyone can read a user profile
        u: { allow: "@user._id=@req_user._id" },  // Users can only update their own profile
        d: { allow: "admin=in=@req_user.role" }   // Only admins can delete users
      },
      
      // Post routes
      "/posts(Posts)": {
        c: { allow: "@req_user._id" },  // Any authenticated user can create posts
        rA: { allow: true },  // Anyone can list posts
        r: { allow: true },   // Anyone can read a post
        u: { 
          allow: { 
            or: [
              "@post.author_id=@req_user._id",  // Author can update
              "admin=in=@req_user.role"         // Admin can update
            ]
          }
        },
        d: { 
          allow: { 
            or: [
              "@post.author_id=@req_user._id",  // Author can delete
              "admin=in=@req_user.role"         // Admin can delete
            ]
          }
        }
      },
      
      // Nested routes - Comments on posts
      "/posts(Posts)/comments(Comments)": {
        c: { 
          allow: "@req_user._id",  // Authenticated users can comment
          filter: "@post._id=@comment.post_id"  // Ensure comment is for the right post
        },
        rA: { 
          allow: true,  // Anyone can read comments
          filter: "@post._id=@comment.post_id"  // Only show comments for this post
        },
        r: { allow: true },
        u: { 
          allow: "@comment.user_id=@req_user._id"  // Users can only edit their own comments
        },
        d: { 
          allow: {
            or: [
              "@comment.user_id=@req_user._id",  // Comment author can delete
              "@post.author_id=@req_user._id",   // Post author can delete comments
              "admin=in=@req_user.role"          // Admin can delete
            ]
          }
        }
      },
      
      // User's posts
      "/users(Users)/posts(Posts)": {
        rA: { 
          allow: true,
          filter: "@user._id=@post.author_id"  // Only show posts by this user
        }
      }
    }
  };
} 