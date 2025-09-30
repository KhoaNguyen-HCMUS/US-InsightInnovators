# 🤖 CHATBOT API - Complete Testing Guide

## 📋 API Overview

The Chatbot API provides AI-powered nutrition consultation and meal planning assistance. Users can create chat sessions and interact with an intelligent assistant for personalized nutrition advice.

---

## 🔗 Base URL

```
http://localhost:3000/api
```

## 🔐 Authentication

All endpoints require JWT token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📚 API Endpoints

### 1. **POST `/api/chat/sessions`** - Create Chat Session

Creates a new chat session for nutrition consultation.

#### Request Body:

```json
{
  "title": "Meal Planning Consultation",
  "context": "meal_planning"
}
```

#### Alternative Examples:

```json
// Weight Loss Consultation
{
  "title": "Tư vấn giảm cân",
  "context": "weight_loss"
}

// Nutrition Analysis
{
  "title": "Phân tích dinh dưỡng",
  "context": "nutrition_analysis"
}

// Recipe Suggestions
{
  "title": "Gợi ý công thức nấu ăn",
  "context": "recipe_suggestions"
}

// Health Consultation
{
  "title": "Tư vấn sức khỏe",
  "context": "health_consultation"
}
```

#### cURL Example:

```bash
curl -X POST http://localhost:3000/api/chat/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Meal Planning Consultation",
    "context": "meal_planning"
  }'
```

#### PowerShell Example:

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

$body = @{
    title = "Meal Planning Consultation"
    context = "meal_planning"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/chat/sessions" -Method POST -Headers $headers -Body $body
```

#### Expected Response:

```json
{
  "success": true,
  "data": {
    "session_id": "123",
    "title": "Meal Planning Consultation",
    "context": "meal_planning",
    "created_at": "2025-09-30T10:00:00Z",
    "status": "active"
  }
}
```

---

### 2. **GET `/api/chat/sessions`** - Get All Sessions

Retrieves all chat sessions for the authenticated user.

#### Query Parameters:

- `limit` (optional): Number of sessions to return (default: 10)
- `status` (optional): Filter by status (active, archived)

#### cURL Example:

```bash
curl -X GET "http://localhost:3000/api/chat/sessions?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PowerShell Example:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/chat/sessions?limit=20" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

#### Expected Response:

```json
{
  "success": true,
  "data": [
    {
      "session_id": "123",
      "title": "Meal Planning Consultation",
      "context": "meal_planning",
      "created_at": "2025-09-30T10:00:00Z",
      "last_message_at": "2025-09-30T10:30:00Z",
      "message_count": 5,
      "status": "active"
    },
    {
      "session_id": "124",
      "title": "Tư vấn giảm cân",
      "context": "weight_loss",
      "created_at": "2025-09-29T15:00:00Z",
      "last_message_at": "2025-09-29T15:45:00Z",
      "message_count": 8,
      "status": "active"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

---

### 3. **POST `/api/chat/messages`** - Send Message

Sends a message to the AI chatbot and receives a response.

#### Request Body Examples:

##### Basic Nutrition Question:

```json
{
  "session_id": "123",
  "message": "Tôi nên ăn gì để giảm cân nhanh mà vẫn đảm bảo sức khỏe?",
  "context": {
    "user_goal": "weight_loss",
    "current_weight": 70,
    "target_weight": 65,
    "timeline": "3_months"
  }
}
```

##### Meal Plan Consultation:

```json
{
  "session_id": "123",
  "message": "Meal plan của tôi có phù hợp không? Tôi đang muốn tăng cân.",
  "context": {
    "current_meal_plan_id": "9",
    "user_goal": "muscle_gain",
    "activity_level": "high",
    "dietary_restrictions": ["no-pork"]
  }
}
```

##### Recipe Request:

```json
{
  "session_id": "124",
  "message": "Hướng dẫn tôi nấu phở bò ít calories cho người giảm cân",
  "context": {
    "cuisine_preference": "vietnamese",
    "cooking_skill": "beginner",
    "time_constraint": "under_30_minutes",
    "dietary_goal": "low_calorie"
  }
}
```

##### Food Substitution:

```json
{
  "session_id": "125",
  "message": "Tôi không ăn được thịt đỏ, có thể thay thế bằng gì trong meal plan?",
  "context": {
    "current_meal_plan_id": "9",
    "dietary_restrictions": ["no_red_meat"],
    "preferred_proteins": ["chicken", "fish", "tofu"]
  }
}
```

##### Health Concern:

```json
{
  "session_id": "126",
  "message": "Tôi bị tiểu đường type 2, nên ăn như thế nào?",
  "context": {
    "medical_conditions": ["diabetes_type_2"],
    "medications": ["metformin"],
    "blood_sugar_target": "normal",
    "age": 45
  }
}
```

#### cURL Example:

```bash
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "session_id": "123",
    "message": "Tôi nên ăn gì để giảm cân nhanh mà vẫn đảm bảo sức khỏe?",
    "context": {
      "user_goal": "weight_loss",
      "current_weight": 70,
      "target_weight": 65,
      "timeline": "3_months"
    }
  }'
```

#### Expected Response:

```json
{
  "success": true,
  "data": {
    "message_id": "456",
    "session_id": "123",
    "user_message": "Tôi nên ăn gì để giảm cân nhanh mà vẫn đảm bảo sức khỏe?",
    "ai_response": "Để giảm cân hiệu quả và an toàn, bạn nên:\n\n1. **Tạo deficit calories hợp lý**: Giảm 300-500 calories/ngày\n2. **Ăn nhiều protein**: Giúp duy trì cơ bắp (1.6-2.2g/kg thể trọng)\n3. **Chọn carbs phức hợp**: Gạo lứt, yến mạch, khoai lang\n4. **Ăn nhiều rau xanh**: Ít calories, nhiều chất xơ\n5. **Uống đủ nước**: 2-3 lít/ngày\n\n**Gợi ý thực đơn:**\n- Sáng: Cháo yến mạch + trứng\n- Trưa: Cơm gạo lứt + thịt nạc + rau\n- Tối: Salad + cá nướng\n\nBạn có muốn tôi tạo meal plan cụ thể không?",
    "ai_suggestions": [
      {
        "type": "meal_plan",
        "title": "Tạo meal plan giảm cân 7 ngày",
        "action": "create_meal_plan",
        "params": {
          "duration": "weekly",
          "goal": "weight_loss",
          "target_calories": 1600
        }
      },
      {
        "type": "food_analysis",
        "title": "Phân tích thực phẩm hiện tại",
        "action": "analyze_current_diet"
      }
    ],
    "context_used": {
      "user_goal": "weight_loss",
      "current_weight": 70,
      "target_weight": 65
    },
    "timestamp": "2025-09-30T10:15:00Z"
  }
}
```

---

### 4. **GET `/api/chat/sessions/:id/messages`** - Get Session Messages

Retrieves all messages from a specific chat session.

#### Path Parameters:

- `id`: Session ID

#### Query Parameters:

- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Skip number of messages (for pagination)

#### cURL Example:

```bash
curl -X GET "http://localhost:3000/api/chat/sessions/123/messages?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Expected Response:

```json
{
  "success": true,
  "data": {
    "session_info": {
      "session_id": "123",
      "title": "Meal Planning Consultation",
      "context": "meal_planning",
      "created_at": "2025-09-30T10:00:00Z"
    },
    "messages": [
      {
        "message_id": "456",
        "user_message": "Tôi nên ăn gì để giảm cân?",
        "ai_response": "Để giảm cân hiệu quả...",
        "timestamp": "2025-09-30T10:15:00Z",
        "context_used": {
          "user_goal": "weight_loss"
        }
      },
      {
        "message_id": "457",
        "user_message": "Làm sao tính calories?",
        "ai_response": "Để tính calories chính xác...",
        "timestamp": "2025-09-30T10:20:00Z"
      }
    ],
    "pagination": {
      "total_messages": 5,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

## 🧪 Complete Testing Workflow

### Step 1: Create Chat Session

```bash
# Create session for meal planning
curl -X POST http://localhost:3000/api/chat/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Tư vấn meal planning",
    "context": "meal_planning"
  }'
```

### Step 2: Send Nutrition Questions

```bash
# Ask about weight loss
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "session_id": "SESSION_ID_FROM_STEP_1",
    "message": "Tôi cao 170cm, nặng 75kg, muốn giảm xuống 70kg. Nên ăn như thế nào?",
    "context": {
      "user_goal": "weight_loss",
      "height": 170,
      "current_weight": 75,
      "target_weight": 70,
      "activity_level": "moderate"
    }
  }'
```

### Step 3: Ask About Specific Meal Plan

```bash
# Reference existing meal plan
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "session_id": "SESSION_ID",
    "message": "Meal plan ID 9 của tôi có phù hợp để giảm cân không?",
    "context": {
      "current_meal_plan_id": "9",
      "user_goal": "weight_loss",
      "evaluation_request": true
    }
  }'
```

### Step 4: Get Session History

```bash
# Retrieve all messages
curl -X GET "http://localhost:3000/api/chat/sessions/SESSION_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Advanced Context Examples

### Weight Management Context:

```json
{
  "user_goal": "weight_loss|weight_gain|maintenance",
  "current_weight": 75,
  "target_weight": 70,
  "height": 170,
  "age": 28,
  "gender": "male|female",
  "activity_level": "sedentary|moderate|active|very_active",
  "timeline": "1_month|3_months|6_months|long_term"
}
```

### Medical Context:

```json
{
  "medical_conditions": ["diabetes_type_2", "hypertension", "high_cholesterol"],
  "allergies": ["nuts", "dairy", "shellfish"],
  "medications": ["metformin", "lisinopril"],
  "dietary_restrictions": ["vegetarian", "no_pork", "halal"]
}
```

### Meal Planning Context:

```json
{
  "current_meal_plan_id": "9",
  "meal_preferences": ["vietnamese", "quick_cooking", "budget_friendly"],
  "cooking_skill": "beginner|intermediate|advanced",
  "time_constraint": "under_15_min|under_30_min|under_60_min|no_limit",
  "kitchen_equipment": ["basic", "full_kitchen", "minimal"]
}
```

---

## 🚀 PowerShell Testing Script

```powershell
# Complete Chatbot API Test
$baseUrl = "http://localhost:3000/api"
$token = "YOUR_JWT_TOKEN"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# 1. Create session
$sessionBody = @{
    title = "Complete Nutrition Consultation"
    context = "meal_planning"
} | ConvertTo-Json

$session = Invoke-RestMethod -Uri "$baseUrl/chat/sessions" -Method POST -Headers $headers -Body $sessionBody
$sessionId = $session.data.session_id

Write-Host "Created session: $sessionId"

# 2. Send message
$messageBody = @{
    session_id = $sessionId
    message = "Tôi muốn tạo meal plan giảm cân cho 1 tuần"
    context = @{
        user_goal = "weight_loss"
        current_weight = 75
        target_weight = 70
        timeline = "1_month"
    }
} | ConvertTo-Json -Depth 3

$response = Invoke-RestMethod -Uri "$baseUrl/chat/messages" -Method POST -Headers $headers -Body $messageBody

Write-Host "AI Response: $($response.data.ai_response)"

# 3. Get session messages
$messages = Invoke-RestMethod -Uri "$baseUrl/chat/sessions/$sessionId/messages" -Method GET -Headers $headers

Write-Host "Total messages: $($messages.data.pagination.total_messages)"
```

---

## 📊 Expected AI Capabilities

The chatbot should be able to:

1. **🍽️ Meal Planning**: Create, analyze, and modify meal plans
2. **📊 Nutrition Analysis**: Calculate calories, macros, and nutrient gaps
3. **🥗 Food Substitutions**: Suggest alternatives for dietary restrictions
4. **👩‍⚕️ Health Consultation**: Provide advice for medical conditions
5. **📚 Recipe Suggestions**: Offer cooking instructions and tips
6. **📈 Progress Tracking**: Monitor weight and nutrition goals
7. **🔄 Plan Modifications**: Update meal plans based on feedback

---

## ⚠️ Error Responses

### 400 Bad Request:

```json
{
  "error": "Invalid input",
  "details": {
    "session_id": ["Session ID is required"],
    "message": ["Message cannot be empty"]
  }
}
```

### 404 Not Found:

```json
{
  "error": "Session not found",
  "message": "Chat session does not exist or access denied"
}
```

### 500 Server Error:

```json
{
  "error": "AI service unavailable",
  "message": "Chatbot is temporarily unavailable. Please try again later."
}
```

---

## 🔧 Integration Tips

1. **Session Management**: Always create a session before sending messages
2. **Context Passing**: Include relevant user data for better AI responses
3. **Error Handling**: Implement retry logic for AI service failures
4. **Rate Limiting**: Respect API rate limits (if implemented)
5. **Response Parsing**: Handle AI suggestions and actionable items
6. **State Management**: Track conversation context across messages

---

## 📝 Next Steps After Testing

1. Test **Profile APIs** to get user nutrition data
2. Test **Meal Plan APIs** integration with chatbot suggestions
3. Test **Food APIs** for detailed nutrition information
4. Implement **frontend chat interface** using these APIs
5. Add **real-time messaging** capabilities if needed

This chatbot API provides comprehensive nutrition consultation capabilities with Vietnamese cuisine focus! 🇻🇳
