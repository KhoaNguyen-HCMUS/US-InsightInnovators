import { 
  FaShoppingCart, 
  FaChartLine, 
  FaUserFriends, 
  FaClock, 
  FaStar,
  FaArrowRight,
  FaPlay,
  FaHeart,
  FaDumbbell,
  FaGraduationCap,
  FaUsers,
} from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';

const HeroLanding = () => {

  return (
    <div className="min-h-screen bg-linear-(--gradient-primary)">
      

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-info-bg text-text-header px-3 sm:px-4 py-2 rounded-full text-sm font-medium mb-6">
            <FaStar className="text-warning" />
            <span className="text-xs sm:text-sm">10,000+ meal plans created • 4.9★ rating</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-text-header mb-6 leading-tight">
            AI-Powered Personalized <span className="text-transparent bg-clip-text bg-linear-(--gradient-text)">Meal Planning</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-text-body mb-8 max-w-2xl mx-auto px-4">
            Perfect fit for your taste, schedule, and budget. Input your health profile and food preferences. AI suggests daily/weekly menus with balanced nutrition and costs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4">
            <button className="w-full sm:w-auto bg-button-bg text-button-text px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-button-hover hover:shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center justify-center space-x-2">
              <span>Create meal plan in 30 seconds</span>
              <FaArrowRight />
            </button>
            <button className="w-full sm:w-auto border-2 border-border-light text-text-body px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center space-x-2">
              <FaPlay />
              <span>Watch demo</span>
            </button>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto px-4">
            <div className="bg-bg rounded-2xl shadow-2xl p-4 sm:p-8 border border-border-light">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-success-bg p-4 sm:p-6 rounded-xl">
                  <FaHeart className="text-success text-xl sm:text-2xl mb-3" />
                  <h3 className="font-semibold text-text-header mb-2 text-sm sm:text-base">Deep Personalization</h3>
                  <p className="text-text-body text-xs sm:text-sm">Based on goals, allergies & personal taste</p>
                </div>
                <div className="bg-info-bg p-4 sm:p-6 rounded-xl">
                  <FaShoppingCart className="text-info text-xl sm:text-2xl mb-3" />
                  <h3 className="font-semibold text-text-header mb-2 text-sm sm:text-base">Auto Shopping Lists</h3>
                  <p className="text-text-body text-xs sm:text-sm">Consolidated ingredients by day/week</p>
                </div>
                <div className="bg-warning-bg p-4 sm:p-6 rounded-xl">
                  <FaChartLine className="text-warning text-xl sm:text-2xl mb-3" />
                  <h3 className="font-semibold text-text-header mb-2 text-sm sm:text-base">Progress Tracking</h3>
                  <p className="text-text-body text-xs sm:text-sm">Calories, macros, meal & cooking reminders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-bg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-header mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-text-body">Just 3 simple steps to get your perfect meal plan</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-contrast font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-text-header">Quick Setup</h3>
              <p className="text-text-body text-sm sm:text-base">Height, weight, goals, favorite foods & restrictions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-secondary-contrast font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-text-header">AI Menu Suggestions</h3>
              <p className="text-text-body text-sm sm:text-base">Choose from 3 options; customize with Smart Substitute</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-secondary-contrast font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-text-header">Shop & Cook</h3>
              <p className="text-text-body text-sm sm:text-base">Export shopping lists; get timed cooking reminders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20 bg-bg-muted">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-header mb-4">Perfect For Everyone</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="bg-bg p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <FaGraduationCap className="text-success text-xl sm:text-2xl mr-3" />
                <h3 className="text-lg sm:text-xl font-semibold text-text-header">Busy Students & Professionals</h3>
              </div>
              <p className="text-text-body mb-4 text-sm sm:text-base">15-30 minutes per meal, optimized costs</p>
              <div className="flex items-center text-success text-xs sm:text-sm">
                <FaClock className="mr-2" />
                <span>Save time & money</span>
              </div>
            </div>
            
            <div className="bg-bg p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <FaDumbbell className="text-info text-xl sm:text-2xl mr-3" />
                <h3 className="text-lg sm:text-xl font-semibold text-text-header">Fitness Enthusiasts</h3>
              </div>
              <p className="text-text-body mb-4 text-sm sm:text-base">Clear macros, smart meal timing</p>
              <div className="flex items-center text-info text-xs sm:text-sm">
                <FaChartLine className="mr-2" />
                <span>Track nutrition precisely</span>
              </div>
            </div>
            
            <div className="bg-bg p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <FaUsers className="text-secondary text-xl sm:text-2xl mr-3" />
                <h3 className="text-lg sm:text-xl font-semibold text-text-header">Families</h3>
              </div>
              <p className="text-text-body mb-4 text-sm sm:text-base">Portion & taste suggestions for each member</p>
              <div className="flex items-center text-secondary text-xs sm:text-sm">
                <FaUserFriends className="mr-2" />
                <span>Suitable for all ages</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Security */}
      <section className="py-16 sm:py-20 bg-bg-alt">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <FaShield className="text-3xl sm:text-4xl text-primary mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-text-header mb-6">Your Data is Secure</h2>
            <p className="text-lg sm:text-xl text-text-body">
              Health data is encrypted and only used for personalized meal planning. 
              You have full control to export or delete your data anytime.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 bg-bg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-header mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-bg-alt p-4 sm:p-6 rounded-xl">
              <h3 className="font-semibold text-text-header mb-3 text-sm sm:text-base">I don't know how to cook?</h3>
              <p className="text-text-body text-xs sm:text-sm">Step-by-step cooking instructions and estimated cooking times are included for every recipe.</p>
            </div>
            
            <div className="bg-bg-alt p-4 sm:p-6 rounded-xl">
              <h3 className="font-semibold text-text-header mb-3 text-sm sm:text-base">What about allergies/dietary restrictions?</h3>
              <p className="text-text-body text-xs sm:text-sm">Mark them once and AI will automatically exclude them from all future suggestions.</p>
            </div>
            
            <div className="bg-bg-alt p-4 sm:p-6 rounded-xl">
              <h3 className="font-semibold text-text-header mb-3 text-sm sm:text-base">Will this increase my food costs?</h3>
              <p className="text-text-body text-xs sm:text-sm">We have a budget optimization mode that helps control and reduce your grocery spending.</p>
            </div>
            
            <div className="bg-bg-alt p-4 sm:p-6 rounded-xl">
              <h3 className="font-semibold text-text-header mb-3 text-sm sm:text-base">Can I use it offline?</h3>
              <p className="text-text-body text-xs sm:text-sm">Yes! It's a PWA (Progressive Web App), so you can view meal plans and shopping lists even without internet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-20 bg-linear-(--gradient-primary)">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto text-primary">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Eat Right, Live Better?</h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90">
              Join 10,000+ people who have transformed their eating habits with Hero
            </p>
            
            <button className="bg-bg text-primary px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2 mx-auto">
              <span>Start Free Today</span>
              <FaArrowRight />
            </button>
            
            <p className="text-xs sm:text-sm opacity-75 mt-4">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroLanding;