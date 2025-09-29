# Nutrition Chatbot API Documentation

## Overview

Comprehensive backend API documentation for the Nutrition Chatbot system, providing nutrition tracking, food logging, meal planning, and AI-powered chatbot functionality.

**Base URL**: `http://localhost:5000/api/nutrition`

**Authentication**: All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 📊 Profile Management

### Get User Profile

**GET** `/profile`

Retrieve the current user's nutrition profile.

**Response:**

```json
{
  "id": "1",
  "user_id": "123",
  "height_cm": 170.5,
  "weight_kg": 65.0,
  "sex": "female",
  "activity_level": "moderate",
  "goal": "maintain",
  "conditions_json": {
    "diabetes": false,
    "hypertension": true,
    "heart_disease": false,
    "kidney_disease": false
  },
  "allergies_json": {
    "nuts": true,
    "shellfish": false,
    "dairy": false,
    "gluten": false,
    "eggs": false
  },
  "preferences_json": {
    "vegetarian": false,
    "vegan": false,
    "keto": false,
    "mediterranean": true,
    "low_carb": false,
    "halal": false,
    "kosher": false
  },
  "bmi": 22.5,
  "bmr": 1350.0,
  "tdee": 1890.0,
  "created_at": "2025-09-29T10:30:00.000Z",
  "updated_at": "2025-09-29T10:30:00.000Z"
}
```

### Update User Profile

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

**BMI Categories:**

- Underweight: < 18.5
- Normal: 18.5 - 24.9
- Overweight: 25.0 - 29.9
- Obese: ≥ 30.0

**BMR Calculation:** Mifflin-St Jeor Equation

- Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
- Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

**TDEE Calculation:** BMR × Activity Factor

- Sedentary (desk job): BMR × 1.2
- Light activity (1-3 days/week): BMR × 1.375
- Moderate activity (3-5 days/week): BMR × 1.55
- Active (6-7 days/week): BMR × 1.725
- Very active (2x/day, intense): BMR × 1.9

---

## 🍎 Food Management

### Search Foods

**GET** `/foods?query={search_term}&page={page}&pageSize={size}`

Search for foods in the database with pagination.

**Query Parameters:**

- `query` (optional): Search term to filter foods by name
- `page` (optional): Page number (default: 1, min: 1)
- `pageSize` (optional): Items per page (default: 20, min: 1, max: 50)

**Example:** `/foods?query=apple&page=1&pageSize=10`

**Response:**

```json
{
  "items": [
    {
      "id": "456",
      "name": "Apple, raw, with skin",
      "brand": null,
      "barcode": null,
      "kcal_100g": 52.0,
      "protein_100g": 0.26,
      "carbs_100g": 13.81,
      "fat_100g": 0.17,
      "fiber_100g": 2.4,
      "sugar_100g": 10.39,
      "sodium_100g": 1.0,
      "calcium_100g": 6.0,
      "iron_100g": 0.12,
      "magnesium_100g": 5.0,
      "phosphorus_100g": 11.0,
      "potassium_100g": 107.0,
      "zinc_100g": 0.04,
      "vitamin_c_100g": 4.6,
      "thiamin_100g": 0.017,
      "riboflavin_100g": 0.026,
      "niacin_100g": 0.091,
      "vitamin_b6_100g": 0.041,
      "folate_100g": 3.0,
      "vitamin_a_100g": 54.0,
      "vitamin_e_100g": 0.18,
      "vitamin_k_100g": 2.2,
      "created_at": "2025-09-29T10:30:00.000Z",
      "updated_at": "2025-09-29T10:30:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 127
}
```

### Get Food Details

**GET** `/foods/{foodId}`

Get detailed nutritional information about a specific food.

**URL Parameters:**

- `foodId`: BigInt ID of the food

**Response:**

```json
{
  "id": "456",
  "name": "Apple, raw, with skin",
  "brand": "Generic",
  "barcode": "123456789012",
  "kcal_100g": 52.0,
  "protein_100g": 0.26,
  "carbs_100g": 13.81,
  "fat_100g": 0.17,
  "fiber_100g": 2.4,
  "sugar_100g": 10.39,
  "sodium_100g": 1.0,
  "calcium_100g": 6.0,
  "iron_100g": 0.12,
  "magnesium_100g": 5.0,
  "phosphorus_100g": 11.0,
  "potassium_100g": 107.0,
  "zinc_100g": 0.04,
  "vitamin_c_100g": 4.6,
  "thiamin_100g": 0.017,
  "riboflavin_100g": 0.026,
  "niacin_100g": 0.091,
  "vitamin_b6_100g": 0.041,
  "folate_100g": 3.0,
  "vitamin_a_100g": 54.0,
  "vitamin_e_100g": 0.18,
  "vitamin_k_100g": 2.2,
  "created_at": "2025-09-29T10:30:00.000Z",
  "updated_at": "2025-09-29T10:30:00.000Z"
}
```

**Error Responses:**

- `404`: Food not found

---

## 🍽️ Meal Management

### Create Meal Entry

**POST** `/meals`

Log a complete meal with multiple food items for the current user.

**Request Body:**

```json
{
  "date_time": "2025-09-29T08:00:00.000Z",
  "type": "breakfast",
  "meal_slot": "morning",
  "items": [
    {
      "food_id": "456",
      "qty_grams": 150.0
    },
    {
      "food_id": "789",
      "qty_grams": 200.0
    },
    {
      "food_id": "321",
      "qty_grams": 30.0
    }
  ]
}
```

**Field Validations:**

- `date_time`: ISO 8601 datetime string (required)
- `type`: String description of meal type (optional)
- `meal_slot`: String slot identifier (optional)
- `items`: Array of food items (required, min: 1 item)
  - `food_id`: BigInt or string ID of food (required)
  - `qty_grams`: Weight in grams (required, min: 1, max: 5000)

**Response:**

```json
{
  "meal": {
    "id": "789",
    "user_id": "123",
    "date_time": "2025-09-29T08:00:00.000Z",
    "type": "breakfast",
    "meal_slot": "morning",
    "source": "user",
    "created_at": "2025-09-29T08:00:00.000Z",
    "updated_at": "2025-09-29T08:00:00.000Z",
    "meal_items": [
      {
        "id": "1001",
        "meal_id": "789",
        "food_id": "456",
        "qty_grams": 150.0,
        "idx": 0,
        "created_at": "2025-09-29T08:00:00.000Z"
      },
      {
        "id": "1002",
        "meal_id": "789",
        "food_id": "789",
        "qty_grams": 200.0,
        "idx": 1,
        "created_at": "2025-09-29T08:00:00.000Z"
      },
      {
        "id": "1003",
        "meal_id": "789",
        "food_id": "321",
        "qty_grams": 30.0,
        "idx": 2,
        "created_at": "2025-09-29T08:00:00.000Z"
      }
    ]
  }
}
```

**Backend Processing:**

- Creates meal record with timestamp and metadata
- Creates meal_items for each food with quantities
- Creates user_food_logs with nutritional snapshots
- Updates user_food_summary with eating patterns
- Calculates nutrition values based on food database

### Get Today's Progress

**GET** `/meals/today`

Get today's nutritional progress and meal summary for the current user.

**Response:**

```json
{
  "totals": {
    "kcal": 1847.5,
    "protein": 73.2,
    "carbs": 198.7,
    "fat": 58.3
  },
  "tdee": 1890.0
}
```

**Calculation Details:**

- Sums all user_food_logs for current day (00:00:00 to 23:59:59)
- Uses nutritional snapshots saved during meal logging
- Includes TDEE from user profile for comparison
- All values calculated from actual consumed portions

---

## 🤖 AI Chatbot (Advanced)

### Create Chat Session

**POST** `/chat/sessions`

Create a new chat session for AI conversations.

**Response:**

```json
{
  "session_id": "123456789"
}
```

### Get All Sessions

**GET** `/chat/sessions?limit={number}`

Get chat sessions for the current user with optional limit.

**Query Parameters:**

- `limit` (optional): Maximum sessions to return (default: 10)

**Response:**

```json
{
  "sessions": [
    {
      "id": "123456789",
      "user_id": "123",
      "started_at": "2025-09-29T10:00:00.000Z",
      "updated_at": "2025-09-29T10:30:00.000Z",
      "lang": "vi",
      "user_message": "Tôi nên ăn gì để giảm cân?",
      "bot_response": "Dựa trên profile của bạn..."
    }
  ]
}
```

### Send Chat Message

**POST** `/chat/messages`

Send a message in a chat session and receive AI-generated response.

**Request Body:**

```json
{
  "session_id": "123456789",
  "role": "user",
  "content": "Tôi nên ăn gì để giảm cân hiệu quả nhất?",
  "top_passages": null,
  "meta": {
    "source": "mobile_app",
    "context": "meal_planning"
  }
}
```

**Field Details:**

- `session_id`: Chat session ID (string or number, required)
- `role`: Message role - "user", "assistant", or "system" (required)
- `content`: Message content (required, max 4000 characters)
- `top_passages`: Optional context passages for RAG
- `meta`: Optional metadata object

**Response for User Message:**

```json
{
  "user_message": {
    "id": "msg_001",
    "turn_index": 0
  },
  "assistant_message": {
    "id": "msg_002",
    "turn_index": 1,
    "content": "Dựa trên thông tin profile của bạn (BMI: 23.0, TDEE: 2070 calories, mục tiêu: giảm cân), đây là những gợi ý dinh dưỡng:\n\n**1. Tạo deficit calories hợp lý:**\n- Ăn khoảng 1570-1670 calories/ngày (giảm 400-500 calories)\n- Tránh giảm quá mức để không làm chậm chuyển hóa\n\n**2. Phân bổ macros tối ưu:**\n- Protein: 25-30% (103-125g) - giữ cơ bắp\n- Carbs: 35-40% (137-167g) - năng lượng\n- Fat: 25-30% (43-56g) - hormone\n\n**3. Thực phẩm nên ưu tiên:**\n- Protein nạc: thịt gà, cá, trứng, đậu hũ\n- Carbs phức: yến mạch, gạo lứt, khoai lang\n- Chất béo tốt: bơ, hạt, dầu oliu\n- Rau xanh: nhiều chất xơ, ít calo\n\n**4. Lưu ý quan trọng:**\n- Bạn có dị ứng hạt - tránh các loại nuts\n- Chế độ Mediterranean phù hợp với sở thích\n- Tăng cường vận động vì đã active\n\nBạn có muốn tôi lập kế hoạch bữa ăn cụ thể không?"
  }
}
```

**Response for Non-User Message:**

```json
{
  "message_id": "msg_003",
  "turn_index": 2
}
```

**AI Context Integration:**

- Automatically loads user profile (BMI, TDEE, allergies, preferences)
- Uses conversation history (last 20 messages) for context
- Gemini 1.5 Flash model with Vietnamese nutrition focus
- Fallback responses when AI unavailable

### Get Session Messages

**GET** `/chat/sessions/{sessionId}/messages`

Get all messages in a specific chat session.

**URL Parameters:**

- `sessionId`: BigInt ID of the chat session

**Response:**

```json
{
  "messages": [
    {
      "id": "msg_001",
      "session_id": "123456789",
      "role": "user",
      "turn_index": 0,
      "content": "Tôi nên ăn gì để giảm cân?",
      "top_passages": null,
      "meta": null,
      "created_at": "2025-09-29T10:00:00.000Z",
      "updated_at": "2025-09-29T10:00:00.000Z"
    },
    {
      "id": "msg_002",
      "session_id": "123456789",
      "role": "assistant",
      "turn_index": 1,
      "content": "Dựa trên thông tin profile của bạn...",
      "top_passages": null,
      "meta": null,
      "created_at": "2025-09-29T10:00:30.000Z",
      "updated_at": "2025-09-29T10:00:30.000Z"
    }
  ]
}
```

**Security Features:**

- Session ownership verification (users can only access their own sessions)
- Turn-based message ordering with indexes
- Automatic session timestamp updates
- Error handling for invalid sessions

---

## 📝 Custom Prompts

### Create Custom Prompt

**POST** `/prompts`

Create a custom nutrition prompt template for reuse.

**Request Body:**

```json
{
  "title": "Weekly Meal Planning for Weight Loss",
  "content": "Create a detailed 7-day meal plan for {goal} with daily calorie target of {calories} calories. Consider these dietary preferences: {dietary_preferences}. Include {protein_target}g protein daily and avoid {allergies}. Provide shopping list and prep instructions.",
  "category": "meal_planning",
  "variables": [
    "goal",
    "calories",
    "dietary_preferences",
    "protein_target",
    "allergies"
  ],
  "tags": ["weight_loss", "weekly_plan", "shopping_list"],
  "is_public": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Custom prompt created successfully",
  "data": {
    "prompt": {
      "id": "404",
      "user_id": "123",
      "title": "Weekly Meal Planning for Weight Loss",
      "content": "Create a detailed 7-day meal plan...",
      "category": "meal_planning",
      "variables": [
        "goal",
        "calories",
        "dietary_preferences",
        "protein_target",
        "allergies"
      ],
      "tags": ["weight_loss", "weekly_plan", "shopping_list"],
      "is_public": false,
      "created_at": "2025-09-29T14:00:00.000Z",
      "updated_at": "2025-09-29T14:00:00.000Z"
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

## 🧪 Backend Testing with cURL

```bash
# Set your token
TOKEN="your-jwt-token-here"

# Get profile
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/nutrition/profile

# Update profile with full data
curl -X PUT \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "height_cm": 170,
       "weight_kg": 65,
       "sex": "female",
       "age": 25,
       "activity_level": "moderate",
       "goal": "maintain",
       "allergies_json": {"nuts": true, "dairy": false},
       "preferences_json": {"vegetarian": true, "mediterranean": false}
     }' \
     http://localhost:5000/api/nutrition/profile

# Search foods
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:5000/api/nutrition/foods?query=apple&page=1&pageSize=5"

# Create meal with multiple items
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "date_time": "2025-09-29T08:00:00.000Z",
       "type": "breakfast",
       "meal_slot": "morning",
       "items": [
         {"food_id": "456", "qty_grams": 150},
         {"food_id": "789", "qty_grams": 200}
       ]
     }' \
     http://localhost:5000/api/nutrition/meals

# Chat with AI
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "session_id": "123",
       "role": "user",
       "content": "Tôi nên ăn gì để tăng cân khỏe mạnh?"
     }' \
     http://localhost:5000/api/nutrition/chat/messages

# Get today's progress
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/nutrition/meals/today
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
PORT=5000
NODE_ENV=development
```

### Server Architecture

```
src/
├── controllers/          # Business logic
│   ├── profileController.ts    # Profile CRUD + BMI/BMR/TDEE calculations
│   ├── foodController.ts       # Food search with pagination
│   ├── mealController.ts       # Complex meal logging with nutrition tracking
│   ├── chatbotController.ts    # AI chat with context awareness
│   └── promptController.ts     # Custom prompt templates
├── routes/
│   └── nutrition.ts           # API routes with authentication
├── middleware/
│   └── auth.ts               # JWT authentication middleware
└── index.ts                  # Server entry point
```

### Database Schema

- **profiles**: User health data with JSON fields for conditions/allergies/preferences
- **foods**: Comprehensive nutrition database (20+ nutrients per 100g)
- **meals**: Meal entries with timestamps and metadata
- **meal_items**: Individual food items within meals
- **user_food_logs**: Nutritional snapshots with calculated values
- **user_food_summary**: Eating pattern analysis and statistics
- **chat_sessions**: AI conversation sessions
- **chat_messages**: Turn-based messaging with role management

This documentation covers all nutrition API endpoints with complete request/response specifications for backend integration and testing.
