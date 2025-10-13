# 🤖 Complete Nutrition & Chatbot API Documentation


## Overview


**Comprehensive AI-Powered Nutrition Advisory System** - Complete backend API documentation providing intelligent nutrition tracking, personalized food recommendations, AI-powered meal planning, behavioral analysis, and context-aware chatbot functionality.


**Base URL**: `http://localhost:5000/api/`


**Authentication**: All endpoints require JWT authentication via `Authorization: Bearer <token>` header.


**AI Engine**: Google Gemini 2.5 Flash with enhanced context awareness for Vietnamese cuisine focus


---


## 👤 Profile Management APIs


### Get User Profile


**GET** `/profile`


Retrieve the current user's complete nutrition profile with calculated health metrics.


**Response:**


```json
{
  "user_id": "123",
  "height_cm": "170.50",
  "weight_kg": "65.00",
  "sex": "female",
  "activity_level": "moderate",
  "goal": "maintain",
  "conditions_json": ["hypertension", "pre_diabetes"],
  "allergies_json": ["nuts", "shellfish"],
  "preferences_json": ["mediterranean", "low_sodium"],
  "bmi": "22.50",
  "bmr": "1350.00",
  "tdee": "1890.00",
  "updated_at": "2025-09-29T10:30:00.000Z"
}
```


### Create User Profile


**POST** `/profile`


Create a new nutrition profile. Returns error if profile already exists.


**Request Body:**


```json
{
  "height_cm": 172.0,
  "weight_kg": 68.0,
  "sex": "female",
  "activity_level": "active",
  "goal": "lose",
  "conditions_json": ["diabetes", "hypertension"],
  "allergies_json": ["nuts", "shellfish"],
  "preferences_json": ["mediterranean", "low_carb"]
}
```


**Field Validations:**


- `height_cm`: 100-250 cm (required)
- `weight_kg`: 30-300 kg (required)
- `sex`: "male" or "female" (required)
- `activity_level`: "sedentary", "light", "moderate", "active", "very_active" (required)
- `goal`: "lose", "maintain", "gain" (required)
- `conditions_json`: Array of health conditions (optional)
- `allergies_json`: Array of food allergies (optional)
- `preferences_json`: Array of dietary preferences (optional)


**Success Response (201):**


```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "user_id": "123",
      "height_cm": "172.00",
      "weight_kg": "68.00",
      "sex": "female",
      "activity_level": "active",
      "goal": "lose",
      "conditions_json": ["diabetes", "hypertension"],
      "allergies_json": ["nuts", "shellfish"],
      "preferences_json": ["mediterranean", "low_carb"],
      "bmi": "23.00",
      "bmr": "1420.00",
      "tdee": "1988.00",
      "updated_at": "2025-09-29T10:30:00.000Z"
    }
  }
}
```


**Error Response (409) - Profile Already Exists:**


```json
{
  "error": "Profile already exists. Use PUT to update.",
  "existing_profile": {
    "id": "1",
    "user_id": "123",
    "created_at": "2025-09-28T10:30:00.000Z"
  }
}
```


### Update User Profile


**PUT** `/profile`


Update existing profile with new health information. Uses upsert logic.


**Request Body:** _(Same as POST)_


**Response:**


```json
{
  "profile": {
    "id": "1",
    "user_id": "123",
    "height_cm": 172.0,
    "weight_kg": 68.0,
    "sex": "female",
    "activity_level": "active",
    "goal": "lose",
    "conditions_json": ["diabetes", "hypertension"],
    "allergies_json": ["nuts", "shellfish"],
    "preferences_json": ["mediterranean", "low_carb"],
    "bmi": 23.0,
    "bmr": 1420.0,
    "tdee": 1988.0,
    "created_at": "2025-09-28T10:30:00.000Z",
    "updated_at": "2025-09-29T10:30:00.000Z"
  },
  "indices": {
    "bmi": 23.0,
    "bmr": 1420.0,
    "tdee": 1988.0
  }
}
```


### Update User Profile (Enhanced)


**PUT** `/profile`


Update the current user's nutrition profile with complete health information.


**Request Body:**


```json
{
  "height_cm": 172.0,
  "weight_kg": 68.0,
  "sex": "female",
  "age": 28,
  "activity_level": "active",
  "goal": "lose",
  "conditions_json": {
    "diabetes": false,
    "hypertension": true,
    "heart_disease": false,
    "kidney_disease": false,
    "thyroid_issues": false,
    "food_intolerances": ["lactose"]
  },
  "allergies_json": {
    "nuts": true,
    "shellfish": false,
    "dairy": false,
    "gluten": false,
    "eggs": false,
    "soy": false,
    "fish": false,
    "sesame": false
  },
  "preferences_json": {
    "vegetarian": false,
    "vegan": false,
    "keto": false,
    "mediterranean": true,
    "low_carb": false,
    "intermittent_fasting": false,
    "halal": false,
    "kosher": false,
    "paleo": false,
    "whole30": false
  }
}
```


**Field Validations:**


- `height_cm`: 100-250 cm (required)
- `weight_kg`: 25-300 kg (required)
- `sex`: "male" or "female" (required)
- `age`: 10-100 years (required)
- `activity_level`: "sedentary", "light", "moderate", "active", "very_active" (required)
- `goal`: "lose", "maintain", "gain" (required)
- `conditions_json`: Object with health conditions (optional)
- `allergies_json`: Object with food allergies (optional)
- `preferences_json`: Object with dietary preferences (optional)


**Response:**


```json
{
  "profile": {
    "id": "1",
    "user_id": "123",
    "height_cm": 172.0,
    "weight_kg": 68.0,
    "sex": "female",
    "activity_level": "active",
    "goal": "lose",
    "conditions_json": {
      "diabetes": false,
      "hypertension": true,
      "heart_disease": false,
      "kidney_disease": false,
      "thyroid_issues": false,
      "food_intolerances": ["lactose"]
    },
    "allergies_json": {
      "nuts": true,
      "shellfish": false,
      "dairy": false,
      "gluten": false,
      "eggs": false,
      "soy": false,
      "fish": false,
      "sesame": false
    },
    "preferences_json": {
      "vegetarian": false,
      "vegan": false,
      "keto": false,
      "mediterranean": true,
      "low_carb": false,
      "intermittent_fasting": false,
      "halal": false,
      "kosher": false,
      "paleo": false,
      "whole30": false
    },
    "bmi": 23.0,
    "bmr": 1380.0,
    "tdee": 2070.0,
    "updated_at": "2025-09-29T11:00:00.000Z"
  },
  "indices": {
    "bmi": 23.0,
    "bmr": 1380.0,
    "tdee": 2070.0
  }
}
```


### Get Profile Health Insights


**GET** `/profile/insights`


🚀 **AI-Powered Health Analysis** - Get intelligent insights about user's health status and recommendations.


**Response:**


```json
{
  "insights": {
    "health_status": {
      "bmi": {
        "value": 23.0,
        "category": "normal",
        "message": "BMI bình thường, hãy duy trì lối sống lành mạnh"
      },
      "weight_status": "Đang giảm cân"
    },
    "targets": {
      "daily_calories": 1600,
      "macros": {
        "protein": 120,
        "carbs": 160,
        "fat": 53
      },
      "water_ml": 2380
    },
    "recommendations": [
      "BMI bình thường, hãy duy trì lối sống lành mạnh",
      "Mục tiêu 1600 calories/ngày để giảm cân",
      "Uống 2380ml nước mỗi ngày"
    ]
  },
  "profile_summary": {
    "user_id": "123",
    "bmi": 23.0,
    "tdee": 1988.0,
    "goal": "lose"
  }
}
```


---


## 🤖 AI Chatbot Integration


### Create Chat Session


**POST** `/chat/sessions`


Start a new conversation session with the AI nutrition advisor.


**Response:**


```json
{
  "session_id": "sess_123456789"
}
```


### Get Chat Sessions


**GET** `/chat/sessions?limit={limit}`


Get user's chat session history.


**Query Parameters:**


- `limit`: Maximum sessions (default: 10, max: 50)


**Response:**


```json
{
  "sessions": [
    {
      "id": "sess_123456789",
      "user_id": "123",
      "started_at": "2025-09-29T10:30:00.000Z",
      "lang": "vi"
    }
  ],
  "total": 1
}
```


### Send Chat Message


**POST** `/chat/messages`


🚀 **Context-Aware AI Conversation** - Send message to AI with enhanced context loading.


**Request Body:**


```json
{
  "session_id": "sess_123456789",
  "role": "user",
  "content": "Tôi muốn giảm cân, gợi ý thực đơn hôm nay?",
  "meta": {
    "include_context": true
  }
}
```


**AI Response Example:**


```json
{
  "message": {
    "id": "msg_987654321",
    "session_id": "sess_123456789",
    "role": "assistant",
    "content": "🥗 Dựa trên profile của bạn (BMI 23.0, mục tiêu giảm cân), bạn đã ăn 1245 kcal hôm nay (63% TDEE), còn 743 kcal.\n\nDo bạn dị ứng nuts và prefer Mediterranean, gợi ý dinner:\n🐟 Cá hồi nướng (300 kcal, 25g protein) + rau củ (200 kcal)\n🥗 Salad quinoa (300 kcal, 12g protein, 45g carbs)\n\n💡 Pattern 7 ngày qua: bạn ăn đều đặn 2.8 bữa/ngày - rất tốt!",
    "created_at": "2025-09-29T14:15:00.000Z"
  },
  "context_used": {
    "profile_data": true,
    "today_progress": true,
    "eating_patterns": true,
    "health_constraints": true
  }
}
```


### Get Session Messages


**GET** `/chat/sessions/{session_id}/messages?limit={limit}`


Get conversation history for a specific session.


**Query Parameters:**


- `limit`: Maximum messages (default: 50)


**Response:**


```json
{
  "messages": [
    {
      "id": "msg_123",
      "session_id": "sess_123456789",
      "role": "user",
      "content": "Tôi muốn giảm cân, gợi ý thực đơn hôm nay?",
      "created_at": "2025-09-29T14:10:00.000Z"
    },
    {
      "id": "msg_124",
      "session_id": "sess_123456789",
      "role": "assistant",
      "content": "🥗 Dựa trên profile của bạn...",
      "created_at": "2025-09-29T14:15:00.000Z"
    }
  ],
  "total": 2
}
```






## 🍽️ AI-Powered Meal Planning APIs


### Generate Meal Plan


**POST** `/meal-plans`


Generate AI-powered meal plan with Vietnamese cuisine focus.


**Request Body:**


```json
{
  "duration": "weekly",
  "title": "Kế hoạch giảm cân tuần 1",
  "preferences": {
    "focus": "weight_loss",
    "exclude_ingredients": ["nuts", "dairy"],
    "preferred_cuisines": ["Vietnamese", "Asian"],
    "cooking_time": "quick",
    "meal_frequency": 3
  }
}
```


**Field Validations:**


- `duration`: "weekly" or "monthly" (required)
- `title`: String 1-255 characters (optional)
- `preferences.focus`: "weight_loss", "muscle_gain", "maintenance"
- `preferences.cooking_time`: "quick", "moderate", "elaborate"
- `preferences.meal_frequency`: 2-6 meals per day


**Success Response (201):**


```json
{
  "success": true,
  "message": "Meal plan generated successfully",
  "data": {
    "id": "9",
    "title": "Kế hoạch giảm cân tuần 1",
    "duration": "weekly",
    "status": "generated",
    "total_days": 7,
    "daily_calories": 1600,
    "created_at": "2025-09-30T10:00:00Z",
    "plan_data": {
      "day_0": {
        "breakfast": {
          "name": "Phở Gà Ít Dầu",
          "calories": 320,
          "protein": 25,
          "carbs": 35,
          "fat": 8,
          "ingredients": ["thịt gà", "bánh phở", "hành lá", "ngò"],
          "cooking_time": "30 phút",
          "cooking_instructions": "Luộc gà, trụng bánh phở, chan nước dùng...",
          "cuisine": "vietnamese"
        },
        "lunch": {
          "name": "Gỏi Cuốn Tôm",
          "calories": 280,
          "ingredients": ["tôm", "bánh tráng", "rau sống", "bún"],
          "cooking_time": "15 phút"
        },
        "dinner": {
          "name": "Canh Chua Cá",
          "calories": 250,
          "ingredients": ["cá", "dứa", "đậu bắp", "cà chua"],
          "cooking_time": "25 phút"
        }
      }
    },
    "nutrition_targets": {
      "calories": 1600,
      "protein": 100,
      "carbs": 180,
      "fat": 53
    },
    "summary": {
      "meals_count": 21,
      "cuisine_focus": "Vietnamese",
      "goal": "weight_loss"
    }
  },
  "actions": {
    "view_details": "/api/meal-plans/9",
    "get_grocery_list": "/api/meal-plans/9/grocery-list"
  }
}
```


### Get All Meal Plans


**GET** `/meal-plans`


Retrieve all meal plans for the authenticated user.


**Query Parameters:**


- `limit` (optional): Number of plans (default: 10)


**Response:**


```json
{
  "meal_plans": [
    {
      "id": "9",
      "title": "Weekly Meal Plan - 09/30/2025",
      "duration": "weekly",
      "created_at": "2025-09-30T10:00:00Z",
      "nutrition_targets": {
        "calories": 1600,
        "protein": 100,
        "carbs": 180,
        "fat": 53
      },
      "plan_overview": {
        "total_days": 7,
        "meals_per_day": 3,
        "total_meals": 21
      }
    }
  ]
}
```


### Get Meal Plan Details


**GET** `/meal-plans/{id}`


Get complete meal plan with all days and meals.


**Response:**


```json
{
  "meal_plan": {
    "id": "9",
    "title": "Weekly Meal Plan",
    "duration": "weekly",
    "created_at": "2025-09-30T10:00:00Z",
    "plan_data": {
      "day_0": {
        "breakfast": {
          "name": "Phở Gà",
          "calories": 350,
          "ingredients": ["gà", "bánh phở", "hành"],
          "cooking_instructions": "..."
        }
      }
    },
    "nutrition_targets": {
      "calories": 1600,
      "protein": 100,
      "carbs": 180,
      "fat": 53
    },
    "grocery_list": {
      "vegetables": [["hành lá", "100g"]],
      "proteins": [["thịt gà", "500g"]],
      "grains": [["bánh phở", "300g"]],
      "other": [["nước mắm", "1 chai"]]
    },
    "start_date": "2025-09-30T10:00:00Z",
    "end_date": "2025-10-07T10:00:00Z"
  }
}
```


### Update Meal Plan


**PUT** `/meal-plans/{id}`


Update meal plan title and preferences.


**Request Body:**


```json
{
  "title": "Updated Weekly Plan - Low Carb Focus",
  "preferences": {
    "focus": "weight_loss",
    "preferred_cuisines": ["Vietnamese"],
    "cooking_time": "quick",
    "meal_frequency": 3
  }
}
```


**Response:**


```json
{
  "success": true,
  "message": "Meal plan updated successfully"
}
```


### Delete Meal Plan


**DELETE** `/meal-plans/{id}`


Delete a meal plan.


**Response:**


```json
{
  "success": true,
  "message": "Meal plan deleted successfully"
}
```


### Get Grocery List


**GET** `/meal-plans/{id}/grocery-list`


Generate shopping list from meal plan.


**Response:**


```json
{
  "grocery_list": {
    "vegetables": [
      [
        "hành lá",
        { "unit": "portion", "category": "vegetables", "quantity": 3 }
      ],
      [
        "ngò gai",
        { "unit": "portion", "category": "vegetables", "quantity": 2 }
      ]
    ],
    "proteins": [
      ["thịt gà", { "unit": "portion", "category": "proteins", "quantity": 2 }],
      ["tôm", { "unit": "portion", "category": "proteins", "quantity": 1 }]
    ],
    "grains": [
      ["gạo", { "unit": "portion", "category": "grains", "quantity": 5 }],
      ["bánh phở", { "unit": "portion", "category": "grains", "quantity": 2 }]
    ],
    "other": [
      ["nước mắm", { "unit": "portion", "category": "other", "quantity": 1 }],
      ["đường", { "unit": "portion", "category": "other", "quantity": 1 }]
    ],
    "generated_at": "2025-09-30T10:05:00Z"
  },
  "meal_plan_title": "Weekly Meal Plan",
  "generated_at": "2025-09-30T10:05:00Z"
}
```


### Substitute Dish


**POST** `/meal-plans/{id}/substitute`


Replace a dish in meal plan with AI-generated alternative.


**Request Body:**


```json
{
  "meal_plan_id": "9",
  "day_index": 0,
  "meal_slot": "lunch",
  "dish_to_replace": {
    "name": "Bún Thịt Nướng",
    "calories": 1000
  },
  "preferences": {
    "cuisine": "Vietnamese",
    "max_cook_time": 30,
    "dietary_requirements": ["low-carb", "high-protein"]
  },
  "reason": "Muốn giảm carb từ 120g xuống dưới 50g"
}
```


**Success Response (200):**


```json
{
  "success": true,
  "message": "Dish substituted successfully",
  "data": {
    "substitution": {
      "timestamp": "2025-09-30T10:00:00Z",
      "day_index": 0,
      "meal_slot": "lunch",
      "original_dish": {
        "name": "Bún Thịt Nướng",
        "calories": 1000
      },
      "substitute_dish": {
        "name": "Thịt Nướng Cuốn Rau Củ",
        "calories": 850,
        "carbs": 35,
        "protein": 75,
        "fat": 35,
        "cooking_time": "25 phút",
        "ingredients": ["200g thịt nạc vai nướng", "rau xà lách", "dưa chuột"],
        "cooking_instructions": "Thịt ướp gia vị nướng, cuốn với rau củ tươi",
        "why_substitute": "Món mới giảm 85g carb so với bún thịt nướng, tăng protein"
      },
      "reason": "Muốn giảm carb từ 120g xuống dưới 50g"
    },
    "nutrition_comparison": {
      "original": {
        "name": "Bún Thịt Nướng",
        "calories": 1000
      },
      "substitute": {
        "name": "Thịt Nướng Cuốn Rau Củ",
        "calories": 850
      },
      "calorie_difference": -150
    }
  }
}
```


---






## 🔧 Data Types & Enums


### Activity Levels


- `sedentary`: Little to no exercise (PAL: 1.2)
- `light`: Light exercise 1-3 days/week (PAL: 1.375)
- `moderate`: Moderate exercise 3-5 days/week (PAL: 1.55)
- `active`: Heavy exercise 6-7 days/week (PAL: 1.725)
- `very_active`: Very heavy exercise, physical job (PAL: 1.9)


### Goals


- `lose`: Weight loss (calorie deficit)
- `maintain`: Weight maintenance
- `gain`: Weight gain (calorie surplus)


### Meal Types


- `breakfast`
- `lunch`
- `dinner`
- `snack`
- `pre_workout`
- `post_workout`


### Chat Roles


- `user`: Human user message
- `assistant`: AI bot response
- `system`: System/admin message


### Health Conditions


```json
{
  "diabetes": boolean,
  "hypertension": boolean,
  "heart_disease": boolean,
  "kidney_disease": boolean,
  "thyroid_issues": boolean,
  "food_intolerances": string[]
}
```


### Common Allergies


```json
{
  "nuts": boolean,
  "shellfish": boolean,
  "dairy": boolean,
  "gluten": boolean,
  "eggs": boolean,
  "soy": boolean,
  "fish": boolean,
  "sesame": boolean
}
```


### Dietary Preferences


```json
{
  "vegetarian": boolean,
  "vegan": boolean,
  "keto": boolean,
  "mediterranean": boolean,
  "low_carb": boolean,
  "intermittent_fasting": boolean,
  "halal": boolean,
  "kosher": boolean,
  "paleo": boolean,
  "whole30": boolean
}
```


---


## ⚠️ Error Handling


All endpoints return consistent error format:


```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```


**Common HTTP Status Codes:**


- `200` - Success
- `201` - Created
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error


**Validation Error Example:**


```json
{
  "error": {
    "fieldErrors": {
      "height_cm": ["Number must be greater than or equal to 100"],
      "weight_kg": ["Required"]
    },
    "formErrors": []
  }
}
```


---


## 🚀 Rate Limits


- **General endpoints**: 100 requests/15 minutes per user
- **Chat endpoints**: 30 requests/5 minutes per user
- **Search endpoints**: 50 requests/10 minutes per user


---


## 🏥 Health Check API


### Health Check


**GET** `/healthz`


Check API server health and AI service availability.


**Response:**


```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T10:00:00Z",
  "services": {
    "database": "connected",
    "gemini_ai": "available",
    "authentication": "active"
  },
  "version": "1.0.0"
}
```


---


## 🚀 Backend Configuration


### Environment Variables


```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nutrition_db"


# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"


# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL_ID="gemini-1.5-flash"


# Server
PORT=3000
NODE_ENV=development
```


### Server Architecture


```
src/
├── controllers/          # Business logic
│   ├── profileController.ts     # Profile CRUD + BMI/BMR/TDEE calculations
│   ├── foodController.ts        # Food search with smart recommendations
│   ├── mealController.ts        # Meal logging with nutrition tracking
│   ├── chatbotController.ts     # AI chat with context awareness
│   ├── promptController.ts      # Custom prompt templates & optimization
│   └── MealPlanController.ts    # AI-powered meal planning with Vietnamese focus
├── routes/
│   └── nutrition.ts            # Complete API routes with authentication
├── middleware/
│   └── auth.ts                 # JWT authentication middleware
├── utils/
│   └── serialization.ts        # BigInt serialization utilities
└── index.ts                    # Server entry point
```


### Complete API Routes List


```typescript
// PROFILE - Enhanced with AI support
GET    /api/profile                    # Get user profile
POST   /api/profile                    # Create profile
PUT    /api/profile                    # Update profile
GET    /api/profile/insights           # AI health insights
GET    /api/profile/constraints        # Health constraints


// FOODS - Smart recommendations
GET    /api/foods                      # Search foods
GET    /api/foods/:id                  # Get food details
GET    /api/foods/recommend            # AI food recommendations
GET    /api/foods/:id/alternatives     # Food alternatives
GET    /api/foods/nutrients/gaps       # Nutrient gap analysis


// MEALS - Advanced analytics
POST   /api/meals                      # Create meal entry
GET    /api/meals/today                # Today's nutrition progress
GET    /api/meals/analytics            # Meal analytics
GET    /api/meals/suggestions          # AI meal suggestions
GET    /api/meals/patterns             # Eating pattern analysis


// CHAT - AI-powered nutrition consultation (all sessions have purpose: "nutrition_assistant")
POST   /api/nutrition/chat/sessions              # Create chat session with automatic purpose assignment
GET    /api/nutrition/chat/sessions              # Get all sessions
POST   /api/nutrition/chat/messages              # Send message to AI
GET    /api/nutrition/chat/sessions/:id/messages # Get session messages


// PROMPTS - Enhanced AI prompt management
POST   /api/prompts                    # Create custom prompt
GET    /api/prompts                    # Get user prompts
POST   /api/prompts/optimize           # Optimize prompt effectiveness
GET    /api/prompts/templates          # Get prompt templates


// MEAL PLANNING - AI-powered meal planning
POST   /api/meal-plans                 # Generate meal plan
GET    /api/meal-plans                 # Get all meal plans
GET    /api/meal-plans/:id             # Get meal plan details
PUT    /api/meal-plans/:id             # Update meal plan
DELETE /api/meal-plans/:id             # Delete meal plan
GET    /api/meal-plans/:id/grocery-list # Generate grocery list
POST   /api/meal-plans/:id/substitute  # Substitute dish with AI


// HEALTH CHECK
GET    /api/healthz                    # System health check
```


**Common HTTP Status Codes:**


- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized (invalid token)
- `404`: Resource not found
- `409`: Conflict (resource already exists)
- `500`: Internal server error



