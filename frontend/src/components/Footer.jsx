import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-[#26f50c] mb-2">Settlr</h3>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Reimagining the way you find your next home. Simple, transparent, and verified listings without the hassle.
            </p>
          </div>

          {/* Platform Section */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="text-gray-400 hover:text-[#26f50c] transition-colors duration-200 text-sm"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/tenant")}
                  className="text-gray-400 hover:text-[#26f50c] transition-colors duration-200 text-sm"
                >
                  For Tenants
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/owner")}
                  className="text-gray-400 hover:text-[#26f50c] transition-colors duration-200 text-sm"
                >
                  For Owners
                </button>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Company</h4>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-400 hover:text-[#26f50c] transition-colors duration-200 text-sm">
                  About Us
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-[#26f50c] transition-colors duration-200 text-sm">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-[#26f50c] transition-colors duration-200 text-sm">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-3 pt-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Settlr. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <div className="w-8 h-8 bg-[#26f50c] rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
