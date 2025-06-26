import './About.css';

const About = () => {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          
          {/* Image Section */}
          <div className="relative group order-1 md:order-1">
            <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <img
                className="about-img object-cover w-full h-64 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px]"
                src="about_image2.jpg"
                alt="Smart Parking System"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live</span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 top-4 left-4 w-full h-full bg-blue-200 rounded-2xl opacity-30"></div>
            <div className="absolute -z-20 top-8 left-8 w-full h-full bg-blue-300 rounded-2xl opacity-20"></div>
          </div>

          {/* Content Section */}
          <div className="space-y-6 order-2 md:order-2">
            
            {/* Header */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 md:w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                <span className="text-blue-600 text-sm md:text-base font-semibold uppercase tracking-wider">
                  About ParkEase
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Smart &{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Hassle-Free
                </span>
                <br />
                Parking
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Our <span className="font-semibold text-gray-800 bg-yellow-100 px-2 py-1 rounded">Smart Car Parking System</span> revolutionizes 
                the way you find, book, and manage parking spots. Experience seamless real-time booking 
                with automated slot allocation and secure payments.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 py-6">
              <div className="text-center p-3 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-xs md:text-sm lg:text-base text-gray-600">Available</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">100%</div>
                <div className="text-xs md:text-sm lg:text-base text-gray-600">Secure</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-600">500+</div>
                <div className="text-xs md:text-sm lg:text-base text-gray-600">Users</div>
              </div>
            </div>

        
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;