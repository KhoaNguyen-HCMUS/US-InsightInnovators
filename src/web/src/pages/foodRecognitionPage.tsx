import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { isAuthenticated } from '../utils/authStorage';
import { predictFood, getFoodDetails, logFoodConsumption } from '../services/food';
import type { NutritionItem, FoodLogResponse, NutritionDetailsResponse } from '../services/food';
import { FaCamera, FaUpload, FaUtensils, FaSearch, FaCheckCircle, FaTimesCircle, FaPlusCircle, FaInfoCircle } from 'react-icons/fa';


export default function FoodRecognitionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keywords, setKeywords] = useState('');
  const [predictions, setPredictions] = useState<Record<string, number> | null>(null);
  const [topPrediction, setTopPrediction] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionItem[] | null>(null);
  const [selectedFood, setSelectedFood] = useState<NutritionItem | null>(null);
  const [nutritionDetails, setNutritionDetails] = useState<NutritionDetailsResponse['data'] | null>(null);
  const [isNutritionLoading, setIsNutritionLoading] = useState(false);
  const [selectedPortionId, setSelectedPortionId] = useState<number | null>(null);
  const [isLoggingFood, setIsLoggingFood] = useState(false);
  const [loggedFood, setLoggedFood] = useState<FoodLogResponse['data'] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const userAuthenticated = isAuthenticated();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsUsingCamera(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Could not access camera. Please check your permissions.');
      setIsUsingCamera(false);
    }
  };
  
  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
    
    setIsUsingCamera(false);
  };
  
  const capturePhoto = () => {
    if (!webcamRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = webcamRef.current.videoWidth;
    canvas.height = webcamRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx && webcamRef.current) {
      ctx.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      stopCamera();
      
      // Convert data URL to blob for upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          if (fileInputRef.current) {
            // Create a DataTransfer object to set the file input value
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
          }
        }
      }, 'image/jpeg');
    }
  };
  
  const handleRecognizeFood = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error('Please upload an image or take a photo first');
      return;
    }
    
    setIsLoading(true);
    setPredictions(null);
    setTopPrediction(null);
    setNutritionData(null);
    setSelectedFood(null);
    setNutritionDetails(null);
    setSelectedPortionId(null);
    
    try {
      const file = fileInputRef.current.files[0];
      const response = await predictFood(file, keywords);
      
      if (response.success) {
        setPredictions(response.predictions);
        setTopPrediction(response.top_prediction);
        setNutritionData(response.nutrition);
        
        // Let user choose the food instead of auto-selecting
        toast.success('Food recognized successfully! Please select a food item.');
      } else {
        toast.error('Failed to recognize food. Please try again.');
      }
    } catch (error) {
      console.error('Error recognizing food:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectFood = async (food: NutritionItem) => {
    setSelectedFood(food);
    setNutritionDetails(null);
    setSelectedPortionId(null);
    
    setIsNutritionLoading(true);
    
    try {
      const response = await getFoodDetails({
        fdcId: food.fdcId
      });
      
      if (response.success) {
        setNutritionDetails(response.data);
        // Set the first portion as selected by default
        if (response.data.portions && response.data.portions.length > 0) {
          setSelectedPortionId(response.data.portions[0].id);
        }
      } else {
        toast.error('Failed to get nutrition details');
      }
    } catch (error) {
      console.error('Error getting nutrition details:', error);
      toast.error('An error occurred while getting nutrition details');
    } finally {
      setIsNutritionLoading(false);
    }
  };
  
  const handleLogFood = async () => {
    if (!selectedFood || !userAuthenticated || !selectedPortionId) {
      if (!userAuthenticated) {
        toast.error('Please log in to track your food consumption');
      } else if (!selectedPortionId) {
        toast.error('Please select a portion size');
      }
      return;
    }
    
    setIsLoggingFood(true);
    
    try {
      const response = await logFoodConsumption({
        fdcId: selectedFood.fdcId,
        portionId: selectedPortionId,
        confirmConsumption: true
      });
      
      if (response.success) {
        setLoggedFood(response.data);
        toast.success('Food logged successfully!');
      } else {
        toast.error('Failed to log food');
      }
    } catch (error) {
      console.error('Error logging food:', error);
      toast.error('An error occurred while logging food');
    } finally {
      setIsLoggingFood(false);
    }
  };
  
  const resetState = () => {
    setImagePreview(null);
    setPredictions(null);
    setTopPrediction(null);
    setNutritionData(null);
    setSelectedFood(null);
    setNutritionDetails(null);
    setSelectedPortionId(null);
    setLoggedFood(null);
    setKeywords('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="min-h-screen bg-linear-(--gradient-primary) py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-header">
            Food Recognition Assistant
          </h1>
          <p className="mt-2 text-text-body">
            Take a photo or upload an image of your food to get nutritional information
          </p>
        </div>
        
        {/* Camera/Upload Section */}
        <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6 border-l-4 border-primary">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-primary rounded-lg mr-3">
              <FaCamera className="text-primary-contrast text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-text-header">
              Capture or Upload Food Image
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {isUsingCamera ? (
                <div className="relative">
                  <video
                    ref={webcamRef}
                    className="w-full h-64 object-cover rounded-lg border border-border-light"
                    autoPlay
                    playsInline
                  />
                  
                  <div className="flex justify-center mt-4 space-x-4">
                    <button
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success-hover transition-colors"
                    >
                      <FaCamera className="inline mr-2" /> Capture Photo
                    </button>
                    
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-error text-error-foreground rounded-md hover:bg-error-hover transition-colors"
                    >
                      <FaTimesCircle className="inline mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col space-y-4">
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-primary text-primary-contrast rounded-md hover:bg-primary-hover transition-colors"
                      disabled={isLoading}
                    >
                      <FaCamera className="inline mr-2" /> Take Photo
                    </button>
                    
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg, image/png"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload food image"
                        title="Upload food image"
                      />
                      <button
                        className="w-full px-6 py-3 bg-button-bg text-button-text rounded-md hover:bg-button-hover transition-colors flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <FaUpload className="mr-2" /> Upload Image
                      </button>
                    </div>
                  </div>
                  
                  {cameraError && (
                    <div className="text-error bg-error-bg p-3 rounded-md mt-2">
                      <FaInfoCircle className="inline mr-2" /> {cameraError}
                    </div>
                  )}
                </>
              )}
              
              <div className="space-y-4 mt-4">
                <label className="block text-sm font-medium text-text-body">
                  Add some add-ons
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Add keywords (e.g., pizza, salad)"
                    className="flex-grow px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                    aria-label="Food keywords to improve recognition"
                    title="Food keywords to improve recognition"
                  />
                </div>
                <p className="text-xs text-text-muted">
                  Adding hints like some toppings "cheese", "meat" can improve recognition accuracy
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              {imagePreview ? (
                <div className="w-full">
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-64 object-cover rounded-lg border border-border-light"
                  />
                  
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleRecognizeFood}
                      className="px-6 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent-hover transition-colors flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <FaSearch className="mr-2" /> Recognize Food
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-border-light rounded-lg flex flex-col items-center justify-center text-text-muted">
                  <FaUtensils className="text-4xl mb-2" />
                  <p>Image preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        {predictions && (
          <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6 border-l-4 border-secondary">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-secondary rounded-lg mr-3">
                <FaUtensils className="text-secondary-contrast text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-text-header">
                Recognition Results
              </h2>
            </div>
            
            <div className="mb-6">
              <div className="bg-success-bg text-success p-4 rounded-lg flex items-center">
                <FaCheckCircle className="text-xl mr-3" />
                <div>
                  <p className="font-semibold">Top Prediction: {topPrediction}</p>
                  <p className="text-sm">Confidence: {topPrediction && predictions ? (predictions[topPrediction] * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
              
            </div>
            
            {nutritionData && nutritionData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Select Food Item:</h3>
                <p className="text-sm text-text-muted mb-4">Please choose the food item that best matches your meal</p>
                <div className="grid grid-cols-1 gap-4">
                  {nutritionData.map((food) => (
                    <div 
                      key={food.fdcId}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedFood?.fdcId === food.fdcId
                          ? 'border-primary bg-primary bg-opacity-10 text-primary-contrast'
                          : 'border-border-light hover:border-primary hover:shadow-md text-text-body'
                      }`}
                      onClick={() => handleSelectFood(food)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{food.description}</h4>
                        {selectedFood?.fdcId === food.fdcId ? (
                          <FaCheckCircle className="text-success" />
                        ) : (
                          <div className="bg-button-ghost-bg text-button-ghost-text px-2 py-1 rounded-md text-xs">
                            Select
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mt-1">{food.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedFood && (
              <div className="mt-6 p-4 bg-bg rounded-lg border border-border-light">
                <h3 className="font-medium text-lg mb-4">Selected Food</h3>
                
                <div className="bg-bg-muted p-4 rounded-md mb-6">
                  <p className="text-lg font-medium">{selectedFood.description}</p>
                  <p className="text-sm text-text-muted mt-1">{selectedFood.category}</p>
                </div>
                
                {isNutritionLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-primary rounded-full"></div>
                  </div>
                ) : nutritionDetails && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Select Portion Size</h4>
                    <div className="space-y-2">
                      {nutritionDetails.portions.map((portion) => (
                        <div 
                          key={portion.id}
                          className={`p-3 rounded-md border cursor-pointer transition-colors ${
                            selectedPortionId === portion.id
                              ? ' bg-accent/50 bg-opacity-10 text-primary'
                              : 'border-border-light hover:border-primary'
                          }`}
                          onClick={() => setSelectedPortionId(portion.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-text-header">{portion.description}</p>
                              <p className="text-sm text-text-body mt-1">{portion.gramWeight}g - {portion.nutrition?.kcal} kcal</p>
                              <div className="flex mt-2 text-sm">
                                <span className="mr-3">Protein: {portion.nutrition?.protein}g</span>
                                <span className="mr-3">Carbs: {portion.nutrition?.carbs}g</span>
                                <span>Fat: {portion.nutrition?.fat}g</span>
                              </div>
                            </div>
                            {selectedPortionId === portion.id && (
                              <FaCheckCircle className="text-success text-lg" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {userAuthenticated && (
                  <div>
                    <button
                      onClick={handleLogFood}
                      className="w-full px-4 py-3 bg-success text-success-foreground hover:bg-success-hover rounded-md transition-colors flex items-center justify-center"
                      disabled={isLoggingFood || !selectedPortionId}
                    >
                      {isLoggingFood ? (
                        <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                      ) : (
                        <FaPlusCircle className="mr-2" />
                      )}
                      {selectedPortionId ? 'Log Food Consumption' : 'Select a portion first'}
                    </button>
                  </div>
                )}
                
                {loggedFood && (
                  <div className="mt-6 p-4 bg-success-bg text-success-foreground rounded-md">
                    <h4 className="font-medium flex items-center">
                      <FaCheckCircle className="mr-2" /> Food Logged Successfully
                    </h4>
                    <p className="text-sm mt-1">
                      Added {loggedFood.food.name} ({loggedFood.nutrition.portion_description}) to your food diary
                    </p>
                    <p className="text-xs mt-1 text-info">
                      Calories: {loggedFood.nutrition.kcal} kcal | 
                      Protein: {loggedFood.nutrition.protein}g | 
                      Carbs: {loggedFood.nutrition.carbs}g | 
                      Fat: {loggedFood.nutrition.fat}g
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={resetState}
                className="px-6 py-3 bg-button-ghost-bg text-button-ghost-text border border-border-light hover:bg-button-ghost-hover rounded-md transition-colors"
              >
                Recognize Another Food
              </button>
            </div>
          </div>
        )}
        
        {/* Information Card */}
        <div className="bg-info-bg border border-info-border rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 p-2 bg-info rounded-lg">
              <FaInfoCircle className="text-info-foreground" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-text-header">How It Works</h3>
              <ul className="mt-2 text-sm space-y-2">
                <li>1. Take a photo or upload an image of your food</li>
                <li>2. Our AI will recognize the food and suggest possible matches</li>
                <li>3. Select the food item that best matches your meal</li>
                <li>4. Choose a portion size for accurate nutritional data</li>
                <li>5. Log the food to track your nutrition goals (requires login)</li>
              </ul>
              <p className="mt-4 text-xs text-text-muted">
                Note: Food recognition accuracy depends on image quality. 
                Add keyword hints to improve results for ambiguous foods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}