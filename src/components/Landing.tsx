import React from 'react';
import { CheckCircle, Target, TrendingUp, Users, Star, ArrowRight, Zap, Shield, Clock, Award, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/resumeATS-white.png'

interface LandingProps {
  onGetStarted: () => void;
  onGoToDashboard?: () => void;
  onStartAnalysis?: () => void;
}

export default function Landing({ onGetStarted, onGoToDashboard, onStartAnalysis }: LandingProps) {
  const { isAuthenticated, user } = useAuth();
  
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "ResumeATS helped me land my dream job at Google. The AI insights were spot-on!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Microsoft",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "Increased my interview rate by 300%. This platform is a game-changer.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist",
      company: "Netflix",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "The detailed analysis helped me understand exactly what recruiters were looking for.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your resume against job requirements in seconds",
      color: "from-yellow-400 to-orange-500"
    },
    // {
    //   icon: Shield,
    //   title: "ATS Optimization",
    //   description: "Ensure your resume passes through Applicant Tracking Systems with our specialized formatting",
    //   color: "from-green-400 to-blue-500"
    // },
    {
      icon: BarChart3,
      title: "Detailed Insights",
      description: "Get comprehensive reports with actionable recommendations to improve your resume",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "No waiting around - get your analysis and recommendations in under 30 seconds",
      color: "from-blue-400 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen  bg-gradient-to-r from-[#182541] to-[#353354] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-14 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ResumeATS</span>
          </div> */}
          <div className="flex items-center justify-center">
          <img src={logo} alt="ResumeATS Logo" className="w-[230px]" />
          {/* <span className="text-2xl font-bold text-white">ResumeATS</span> */}
        </div>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              {/* <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a> */}
            </nav>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* <span className="text-gray-300">Welcome back, {user?.name || user?.email}!</span> */}
                <button
                  onClick={onGoToDashboard}
                  className="bg-gradient-to-r from-[#5d81cf] to-[#5d81cf] hover:from-[#5d81cf] hover:to-[#5d81cf] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* <div className="inline-flex items-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-3 mb-8">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-blue-200 font-medium">
                {isAuthenticated ? "Ready to optimize your next resume?" : "Trusted by 50,000+ job seekers"}
              </span>
            </div> */}
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              {isAuthenticated ? (
                <>
                  Welcome back,
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-gradient">
                    {user?.name || 'User'}!
                  </span>
                </>
              ) : (
                <>
              Your Resume's
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                Secret Weapon
              </span>
                </>
              )}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              {isAuthenticated ? (
                "Ready to optimize another resume? Access your dashboard to manage your resumes, job descriptions, and analysis results."
              ) : (
                "Beat the ATS algorithms and land more interviews with our AI-powered resume optimization platform. Get instant feedback, keyword analysis, and personalized recommendations."
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={onGoToDashboard}
                    className="group bg-gradient-to-r from-[#5d81cf] to-[#5d81cf] hover:from-[#5d81cf] hover:to-[#5d81cf] text-white text-lg px-12 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 flex items-center space-x-3"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={onStartAnalysis}
                    className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-12 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 flex items-center space-x-3"
                  >
                    <span>Start New Analysis</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <>
              <button
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-12 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 flex items-center space-x-3"
              >
                <span>Start Free Analysis</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center space-x-2 text-gray-300">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No credit card required</span>
              </div>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            {/* <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-gray-400 text-sm">Trusted by professionals at:</div>
              <div className="flex items-center space-x-8 text-gray-200 font-semibold">
                <span>Google</span>
                <span>Microsoft</span>
                <span>Amazon</span>
                <span>Apple</span>
                <span>Meta</span>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-14 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <Users className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-4xl font-bold text-white mb-2">50K+</h3>
                <p className="text-gray-300">Resumes Optimized</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-4xl font-bold text-white mb-2">3x</h3>
                <p className="text-gray-300">More Interviews</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <CheckCircle className="h-12 w-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-4xl font-bold text-white mb-2">98%</h3>
                <p className="text-gray-300">Success Rate</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-4xl font-bold text-white mb-2">&lt;30s</h3>
                <p className="text-gray-300">Analysis Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-14 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to create a resume that gets noticed by both ATS systems and human recruiters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-14 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to transform your resume into an interview-generating machine
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  1
                </div>
                {/* <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform -translate-x-1/2 hidden md:block"></div> */}
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-4">Upload Resume</h3>
                <p className="text-gray-300">Upload your existing resume or build one using our intuitive form builder</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  2
                </div>
                {/* <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-600 transform -translate-x-1/2 hidden md:block"></div> */}
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-4">Add Job Description</h3>
                <p className="text-gray-300">Paste the job description you're applying for to get targeted analysis</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-[#5d81cf] to-[#5d81cf] text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  3
                </div>
                {/* <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-500 to-blue-600 transform -translate-x-1/2 hidden md:block"></div> */}
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <Award className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-4">Get Results</h3>
                <p className="text-gray-300">Receive detailed analysis with actionable recommendations and ATS score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section id="testimonials" className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Success Stories</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their careers with ResumeATS
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 border-2 border-white/20"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-300 text-sm">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Land Your Dream Job?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join over 50,000 professionals who've already optimized their resumes and increased their interview rates by 300%
            </p>
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-16 py-5 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
            >
              <span>Start Your Free Analysis</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-400 mt-4">No credit card required • Results in under 30 seconds</p>
          </div>
        </div>
      </section> */}


    </div>
  );
}