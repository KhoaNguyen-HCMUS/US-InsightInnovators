# 🤖 Nutrition Chatbot API Documentation

## Overview

**Comprehensive AI-Powered Nutrition Advisory System** - Complete backend API documentation providing intelligent nutrition tracking, personalized food recommendations, behavioral analysis, and context-aware chatbot functionality.

**Base URL**: `http://localhost:5000/api/nutrition`

**Authentication**: All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

**AI Engine**: Google Gemini 1.5 Flash with enhanced context awareness

---

## 🎯 Quick Start Guide

### Essential Workflow:

1. **Create Profile** → `POST /profile` (Basic health info)
2. **Get Insights** → `GET /profile/insights` (AI health analysis)
3. **Log Meals** → `POST /meals` (Track nutrition)
4. **Get Recommendations** → `GET /foods/recommend` (Smart food suggestions)
5. **Chat with AI** → `POST /chat/messages` (Intelligent nutrition advice)

---

## 📊 Profile Management

### Get User Profile

**GET** `/profile`

Retrieve the current user's complete nutrition profile with calculated health metrics.

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
  "conditions_json": ["hypertension", "pre_diabetes"],
  "allergies_json": ["nuts", "shellfish"],
  "preferences_json": ["mediterranean", "low_sodium"],
  "bmi": 22.5,
  "bmr": 1350.0,
  "tdee": 1890.0,
  "created_at": "2025-09-29T10:30:00.000Z",
  "updated_at": "2025-09-29T10:30:00.000Z"
}
```

### Create User Profile

**POST** `/profile`

Create a new nutrition profile. Returns error if profile already exists.

**Request Body:**

```json
{
  "age": 28,
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

- `age`: 10-100 years (required)
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
  "message": "Profile created successfully",
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
    "created_at": "2025-09-29T10:30:00.000Z",
    "updated_at": "2025-09-29T10:30:00.000Z"
  },
  "calculated_indices": {
    "bmi": 23.0,
    "bmr": 1420.0,
    "tdee": 1988.0
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

### Get Health Constraints

**GET** `/profile/constraints`

🚀 **Smart Health & Dietary Constraints Analysis** - Get parsed constraints for safe food recommendations.

**Response:**

```json
{
  "constraints": {
    "allergies": {
      "items": ["nuts", "shellfish"],
      "restrictions": ["Tránh hoàn toàn nuts", "Tránh hoàn toàn shellfish"]
    },
    "medical_conditions": {
      "items": ["diabetes", "hypertension"],
      "guidelines": [
        "Hạn chế đường, ưu tiên complex carbs",
        "Giảm muối <2g/ngày, tăng kali"
      ]
    },
    "dietary_preferences": {
      "items": ["mediterranean", "low_carb"],
      "focus": ["Dầu olive, cá, rau củ", "Giảm carb <100g/ngày"]
    }
  },
  "profile_id": "123"
}
```

---

## 🍎 Smart Food Management

### Search Foods

**GET** `/foods?q={query}&limit={limit}`

Search foods in database with nutrition information.

**Query Parameters:**

- `q`: Search query (food name)
- `limit`: Maximum results (default: 20, max: 50)

**Response:**

```json
{
  "foods": [
    {
      "id": "1",
      "name": "Cơm trắng",
      "kcal_100g": 130,
      "protein_100g": 2.7,
      "carbs_100g": 28.2,
      "fat_100g": 0.3,
      "fiber_100g": 0.4,
      "sugar_100g": 0.1,
      "sodium_100g": 1.0
    }
  ],
  "total": 1
}
```

### Get Food Details

**GET** `/foods/{id}`

Get detailed nutrition information for a specific food.

**Response:**

```json
{
  "food": {
    "id": "1",
    "name": "Cơm trắng",
    "kcal_100g": 130,
    "protein_100g": 2.7,
    "carbs_100g": 28.2,
    "fat_100g": 0.3,
    "fiber_100g": 0.4,
    "sugar_100g": 0.1,
    "sodium_100g": 1.0,
    "created_at": "2025-09-29T10:30:00.000Z"
  }
}
```

### Get Smart Food Recommendations

**GET** `/foods/recommend?goal={goal}&meal_type={type}&limit={limit}`

🚀 **AI-Powered Smart Recommendations** - Get personalized food suggestions based on profile, goals, and constraints.

**Query Parameters:**

- `goal`: "lose", "maintain", "gain" (optional, uses profile goal)
- `meal_type`: "breakfast", "lunch", "dinner", "snack" (optional)
- `limit`: Maximum results (default: 10)

**Response:**

```json
{
  "recommendations": [
    {
      "food": {
        "id": "15",
        "name": "Cá hồi nướng",
        "kcal_100g": 206,
        "protein_100g": 25.4,
        "carbs_100g": 0,
        "fat_100g": 12.4
      },
      "recommendation_score": 85,
      "reasons": [
        "Cao protein phù hợp mục tiêu lose weight",
        "Omega-3 tốt cho tim mạch",
        "Không chứa allergens của bạn"
      ],
      "suggested_portion": "150g (309 kcal)"
    }
  ],
  "context": {
    "user_goal": "lose",
    "allergies_avoided": ["nuts", "shellfish"],
    "preferences_matched": ["mediterranean"]
  }
}
```

### Get Food Alternatives

**GET** `/foods/{id}/alternatives?reason={reason}&limit={limit}`

🚀 **Smart Alternative Suggestions** - Get safe alternatives for foods user cannot eat.

**Query Parameters:**

- `reason`: "allergy", "preference", "health" (optional)
- `limit`: Maximum results (default: 5)

**Response:**

```json
{
  "original_food": {
    "id": "25",
    "name": "Hạnh nhân",
    "kcal_100g": 575
  },
  "alternatives": [
    {
      "food": {
        "id": "30",
        "name": "Hạt hướng dương",
        "kcal_100g": 584,
        "protein_100g": 20.8
      },
      "similarity_score": 88,
      "why_safe": "Không chứa tree nuts, safe cho allergy",
      "nutrition_comparison": "Tương tự protein và healthy fats"
    }
  ],
  "safety_check": {
    "allergies_avoided": ["nuts"],
    "safe_for_conditions": ["diabetes", "hypertension"]
  }
}
```

### Analyze Nutrient Gaps

**GET** `/foods/nutrients/gaps?days={days}`

🚀 **Personalized Nutrient Analysis** - Identify nutritional deficiencies and get targeted recommendations.

**Query Parameters:**

- `days`: Analysis period (default: 7)

**Response:**

```json
{
  "analysis": {
    "period": 7,
    "averages": {
      "protein": 45.2,
      "fiber": 18.5,
      "vitamin_c": 65.0,
      "calcium": 420.0
    },
    "targets": {
      "protein": 60.0,
      "fiber": 25.0,
      "vitamin_c": 90.0,
      "calcium": 1000.0
    },
    "gaps": [
      {
        "nutrient": "protein",
        "current": 45.2,
        "target": 60.0,
        "deficit": 14.8,
        "severity": "moderate"
      }
    ]
  },
  "recommendations": [
    {
      "nutrient": "protein",
      "foods": ["Ức gà", "Cá hồi", "Đậu phụ"],
      "tips": "Thêm protein vào mỗi bữa ăn"
    }
  ]
}
```

---

## 🍽️ Advanced Meal Management

### Create Meal

**POST** `/meals`

Log a meal with multiple food items and automatic nutrition calculation.

**Request Body:**

```json
{
  "meal_type": "lunch",
  "items": [
    {
      "food_id": "1",
      "qty_grams": 150
    },
    {
      "food_id": "15",
      "qty_grams": 120
    }
  ]
}
```

**Response:**

```json
{
  "meal": {
    "id": "5",
    "user_id": "123",
    "meal_type": "lunch",
    "created_at": "2025-09-29T12:30:00.000Z",
    "meal_items": [
      {
        "id": "10",
        "meal_id": "5",
        "food_id": "1",
        "qty_grams": 150,
        "idx": 0
      }
    ]
  }
}
```

### Get Today's Progress

**GET** `/meals/today`

Get real-time nutrition progress for today vs. targets.

**Response:**

```json
{
  "totals": {
    "kcal": 1245,
    "protein": 58.5,
    "carbs": 145.2,
    "fat": 42.1
  },
  "tdee": 1988,
  "progress": {
    "calories_percent": 63,
    "remaining_calories": 743,
    "protein_percent": 98,
    "carbs_percent": 91,
    "fat_percent": 79
  }
}
```

### Get Meal Analytics

**GET** `/meals/analytics?days={days}`

🚀 **Advanced Eating Pattern Analysis** - Comprehensive behavioral insights and trends.

**Query Parameters:**

- `days`: Analysis period (default: 7, max: 30)

**Response:**

```json
{
  "analytics": {
    "daily_stats": {
      "2025-09-29": {
        "kcal": 1245,
        "protein": 58.5,
        "carbs": 145.2,
        "fat": 42.1,
        "meals": 3
      }
    },
    "averages": {
      "kcal": 1680,
      "protein": 72.3,
      "carbs": 185.4,
      "fat": 58.2,
      "meals_per_day": 2.8
    },
    "patterns": {
      "consistency": "Đều đặn",
      "calorie_trend": "Bình thường",
      "protein_adequate": "Đủ"
    }
  },
  "period": {
    "days": 7,
    "start": "2025-09-22T00:00:00.000Z",
    "total_meals": 20
  }
}
```

### Get Meal Suggestions

**GET** `/meals/suggestions?type={meal_type}`

🚀 **Context-Aware Meal Suggestions** - Smart recommendations based on remaining calories and constraints.

**Query Parameters:**

- `type`: "breakfast", "lunch", "dinner", "snack", "any" (default: "any")

**Response:**

```json
{
  "suggestions": [
    {
      "meal_type": "dinner",
      "name": "Cá hồi với quinoa",
      "kcal": 380,
      "protein": 28,
      "carbs": 35,
      "fat": 15,
      "suitable_for": true,
      "reason": "Omega-3, protein chất lượng cao"
    }
  ],
  "context": {
    "consumed_today": {
      "kcal": 1245,
      "protein": 58.5,
      "carbs": 145.2,
      "fat": 42.1
    },
    "remaining_targets": {
      "kcal": 743,
      "protein": 61.5,
      "carbs": 54.8,
      "fat": 10.9
    },
    "progress_percent": 63
  }
}
```

### Get Eating Patterns

**GET** `/meals/patterns?days={days}`

🚀 **Behavioral Pattern Recognition** - Deep analysis of eating habits with actionable insights.

**Query Parameters:**

- `days`: Analysis period (default: 14)

**Response:**

```json
{
  "patterns": {
    "hourly": {
      "7": 5,
      "12": 8,
      "19": 7,
      "22": 3
    },
    "weekly": {
      "0": 4,
      "1": 6,
      "2": 5,
      "3": 6,
      "4": 5,
      "5": 4,
      "6": 3
    },
    "meal_times": {
      "breakfast": 10,
      "lunch": 12,
      "dinner": 11,
      "late_snack": 2
    }
  },
  "insights": {
    "regular_breakfast": true,
    "regular_lunch": true,
    "regular_dinner": true,
    "late_eating": false,
    "weekend_consistent": false
  },
  "recommendations": ["Duy trì thói quen ăn uống nhất quán cả cuối tuần"],
  "period": {
    "days": 14,
    "total_meals": 35
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

---

## 🧠 AI Prompt Management

### Create Prompt

**POST** `/prompts`

Save a prompt for future reference and analysis.

**Request Body:**

```json
{
  "prompt_text": "Gợi ý thực đơn giảm cân cho người dị ứng nuts",
  "response_text": "Cá hồi + rau củ + quinoa...",
  "purpose": "meal_planning"
}
```

**Response:**

```json
{
  "id": "prompt_456"
}
```

### Get User Prompts

**GET** `/prompts?purpose={purpose}&limit={limit}`

Get user's prompt history with optional filtering.

**Query Parameters:**

- `purpose`: Filter by purpose (optional)
- `limit`: Maximum results (default: 20, max: 50)

**Response:**

```json
{
  "prompts": [
    {
      "id": "prompt_456",
      "prompt_text": "Gợi ý thực đơn giảm cân cho người dị ứng nuts",
      "response_text": "Cá hồi + rau củ + quinoa...",
      "purpose": "meal_planning",
      "created_at": "2025-09-29T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### Optimize Prompt

**POST** `/prompts/optimize`

🚀 **AI Prompt Enhancement** - Automatically optimize prompts with user context for better AI responses.

**Request Body:**

```json
{
  "user_message": "Tôi muốn giảm cân",
  "context_type": "nutrition",
  "include_profile": true
}
```

**Response:**

```json
{
  "optimized_prompt": "🥗 Trả lời về dinh dưỡng với số liệu cụ thể (kcal, protein, carbs, fat)\n🚫 Luôn kiểm tra allergies và medical conditions trước khi gợi ý\n...\n\n📋 PROFILE USER:\n- Thể chất: female, 172cm, 68kg, BMI 23.0 (bình thường)\n- Mục tiêu: lose | Hoạt động: active | TDEE: 1988 kcal/ngày\n...\n\n❓ User question: \"Tôi muốn giảm cân\"\n\n🎯 Hãy trả lời với:\n- Thông tin chính xác và cụ thể\n- Số liệu rõ ràng khi phù hợp\n- Tôn trọng health constraints của user\n- Tone tự nhiên, friendly nhưng professional\n- Actionable advice user có thể apply ngay",
  "original_message": "Tôi muốn giảm cân",
  "context_applied": "nutrition",
  "has_profile_context": true,
  "prompt_id": "prompt_789"
}
```

### Get Prompt Templates

**GET** `/prompts/templates?category={category}`

🚀 **Smart Template System** - Get reusable prompt templates for different use cases.

**Query Parameters:**

- `category`: "nutrition", "fitness", "health", "all" (default: "all")

**Response:**

```json
{
  "templates": {
    "nutrition": [
      {
        "name": "Meal Planning",
        "template": "Gợi ý thực đơn {meal_type} cho mục tiêu {goal} với {calories} kcal, tránh {allergies}",
        "variables": ["meal_type", "goal", "calories", "allergies"],
        "example": "Gợi ý thực đơn breakfast cho mục tiêu lose với 400 kcal, tránh nuts"
      },
      {
        "name": "Macro Analysis",
        "template": "Phân tích macro của món {food_name} và đánh giá phù hợp cho {goal}",
        "variables": ["food_name", "goal"],
        "example": "Phân tích macro của món cơm gà và đánh giá phù hợp cho lose weight"
      }
    ],
    "fitness": [
      {
        "name": "Workout Planning",
        "template": "Thiết kế workout {duration} phút cho {goal} với equipment {equipment}",
        "variables": ["duration", "goal", "equipment"],
        "example": "Thiết kế workout 30 phút cho weight loss với equipment dumbbells"
      }
    ]
  },
  "categories": ["nutrition", "fitness", "health"],
  "usage": "Sử dụng {variable} trong template và replace với giá trị thực tế"
}
```

### Health Check

**GET** `/healthz`

Check API and database connectivity status.

**Response:**

```json
{
  "ok": true,
  "timestamp": "2025-09-29T14:30:00.000Z"
}
```

---

## 🎯 Integration Examples

### Complete Workflow Example

```javascript
// 1. Create profile
const profile = await fetch("/api/nutrition/profile", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    age: 28,
    height_cm: 172,
    weight_kg: 68,
    sex: "female",
    activity_level: "active",
    goal: "lose",
    allergies_json: ["nuts"],
    preferences_json: ["mediterranean"],
  }),
});

// 2. Get health insights
const insights = await fetch("/api/nutrition/profile/insights");

// 3. Log breakfast
const meal = await fetch("/api/nutrition/meals", {
  method: "POST",
  body: JSON.stringify({
    meal_type: "breakfast",
    items: [
      { food_id: "1", qty_grams: 150 },
      { food_id: "15", qty_grams: 100 },
    ],
  }),
});

// 4. Get smart recommendations
const recommendations = await fetch(
  "/api/nutrition/foods/recommend?meal_type=lunch"
);

// 5. Chat with AI
const session = await fetch("/api/nutrition/chat/sessions", { method: "POST" });
const sessionId = session.session_id;

const aiResponse = await fetch("/api/nutrition/chat/messages", {
  method: "POST",
  body: JSON.stringify({
    session_id: sessionId,
    role: "user",
    content: "Gợi ý bữa trưa cho mục tiêu giảm cân?",
  }),
});
```

### Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)",
  "code": "ERROR_CODE (optional)"
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized (invalid token)
- `404`: Resource not found
- `409`: Conflict (resource already exists)
- `500`: Internal server error

---

## 🔧 Advanced Features

### Smart Context Loading

- **Real-time Profile Data**: BMI, TDEE, health constraints
- **Today's Progress**: Calories consumed, remaining targets
- **Behavioral Patterns**: 7-day eating frequency analysis
- **Health Safety**: Automatic allergy and condition checking

### AI Intelligence Features

- **Goal-Aligned Recommendations**: Personalized for lose/gain/maintain
- **Pattern Recognition**: "Bạn thường skip breakfast"
- **Contextual Advice**: "Còn 743 kcal có thể ăn hôm nay"
- **Health-Conscious**: Respects medical conditions and allergies

### Performance Optimizations

- **Efficient Database Queries**: Optimized joins and indexing
- **Smart Caching**: Profile and food data caching
- **Batch Operations**: Multiple food items in single meal
- **Real-time Analytics**: Fast pattern computation

---

## 🚀 Production Deployment Notes

### Environment Variables

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_ID=gemini-1.5-flash
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Rate Limiting Recommendations

- **Chat Messages**: 30 requests/minute per user
- **Food Recommendations**: 10 requests/minute per user
- **Profile Updates**: 5 requests/minute per user

### Monitoring Endpoints

- **Health Check**: `GET /healthz`
- **Database Status**: Monitor Prisma connection
- **AI Service**: Monitor Gemini API responses

---

**🎉 Ready for Production! Complete AI-powered nutrition advisory system with intelligent context awareness, behavioral analysis, and personalized recommendations.**
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
"created_at": "2025-09-29T10:30:00.000Z",
"updated_at": "2025-09-29T10:30:00.000Z"
},
"calculated_indices": {
"bmi": 23.0,
"bmr": 1420.0,
"tdee": 1988.0
}
}

````

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
````

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
