import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebase";
import Footer from "../components/Footer";

function TenantProfile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);  // ✅ View or Edit mode
  const [profileExists, setProfileExists] = useState(false);  // ✅ Track if profile exists

  const [formData, setFormData] = useState({
    phoneNumber: "",
    age: "",
    gender: "",
    occupation: "",
    organization: "",
    currentCity: "",
    budget: { min: "", max: "" },
    preferredCity: "",
    preferredLocations: [],
    propertyType: "Any",
    bhkPreference: [],
    furnishingPreference: "Any",
    moveInDate: "",
    foodPreference: "",
    smokingHabit: false,
    drinkingHabit: false,
    hasPets: false,
    petDetails: "",
    requiredAmenities: [],
    bio: ""
  });

  // ✅ Log component mount
  useEffect(() => {
    console.log("==================================================");
    console.log("🚀 TENANT PROFILE COMPONENT MOUNTED");
    console.log("==================================================");
    console.log("📊 Auth State:", { user, loading });
    console.log("📊 Firebase Auth:", { 
      currentUser: auth.currentUser ? "EXISTS" : "NULL",
      uid: auth.currentUser?.uid || "N/A"
    });
  }, []);

  // ✅ Fetch existing profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log("\n--------------------------------------------------");
    console.log("🔄 FETCHING PROFILE");
    console.log("--------------------------------------------------");
    
    try {
      console.log("1️⃣ Checking authentication...");
      if (!auth.currentUser) {
        console.warn("⚠️ auth.currentUser is NULL");
        setIsLoading(false);
        setIsEditing(true);  // ✅ Start in edit mode if no auth
        return;
      }
      console.log("✅ auth.currentUser exists:", auth.currentUser.uid);

      console.log("2️⃣ Getting Firebase ID token...");
      const token = await auth.currentUser.getIdToken();
      console.log("✅ Token obtained");

      console.log("3️⃣ Making GET request");
      const response = await fetch("http://localhost:5000/api/tenant/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("4️⃣ Response received:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("5️⃣ Response data:", data);
        
        if (data.profileExists) {
          console.log("✅ Profile exists! Loading data...");
          setFormData(data.tenant);
          setProfileExists(true);  // ✅ Profile exists
          setIsEditing(false);  // ✅ Start in view mode
        } else {
          console.log("ℹ️ No existing profile - user will create new one");
          setProfileExists(false);
          setIsEditing(true);  // ✅ Start in edit mode
        }
      }
    } catch (error) {
      console.error("❌ ERROR FETCHING PROFILE:", error);
      setIsEditing(true);  // ✅ Start in edit mode on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log("📝 Input changed:", { name, value: type === "checkbox" ? checked : value });
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (field, value) => {
    console.log("📝 Multi-select changed:", { field, value });
    setFormData(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("\n==================================================");
    console.log("💾 SUBMITTING PROFILE");
    console.log("==================================================");
    
    setIsSubmitting(true);
    setError("");

    try {
      console.log("1️⃣ Checking authentication...");
      if (!auth.currentUser) {
        const errorMsg = "Not authenticated";
        console.error("❌", errorMsg);
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }
      console.log("✅ Authenticated as:", auth.currentUser.uid);

      console.log("2️⃣ Validating required fields...");
      const requiredFields = {
        phoneNumber: formData.phoneNumber,
        age: formData.age,
        occupation: formData.occupation,
        budgetMin: formData.budget.min,
        budgetMax: formData.budget.max,
        preferredCity: formData.preferredCity
      };
      
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
        console.error("❌", errorMsg);
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }
      console.log("✅ All required fields present");

      console.log("3️⃣ Getting Firebase ID token...");
      const token = await auth.currentUser.getIdToken();
      console.log("✅ Token obtained");

      console.log("4️⃣ Making POST request...");
      const response = await fetch("http://localhost:5000/api/tenant/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log("5️⃣ Response received:", response.status);
      const data = await response.json();

      if (response.ok) {
        console.log("✅ SUCCESS! Profile saved!");
        setSuccess(true);
        setProfileExists(true);  // ✅ Profile now exists
        setIsEditing(false);  // ✅ Switch to view mode
        
        console.log("6️⃣ Switching to view mode...");
        // Don't redirect, just switch to view mode
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        const errorMsg = data.message || "Failed to save profile";
        console.error("❌ SAVE FAILED:", errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error("❌ CRITICAL ERROR:", error);
      
      let errorMsg = "Failed to save profile. ";
      if (error.message === "Failed to fetch") {
        errorMsg += "Cannot connect to backend server.";
      } else {
        errorMsg += error.message;
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Profile View Component
  const ProfileView = () => (
    <div className="space-y-8">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">Your Profile</h2>
          <p className="text-gray-600 mt-2">View and manage your rental preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="text-lg font-semibold text-gray-900">{formData.phoneNumber || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Age</p>
            <p className="text-lg font-semibold text-gray-900">{formData.age || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="text-lg font-semibold text-gray-900">{formData.gender || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">💼</span>
          Professional Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Occupation</p>
            <p className="text-lg font-semibold text-gray-900">{formData.occupation || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{formData.occupation === "Student" ? "College/University" : "Company"}</p>
            <p className="text-lg font-semibold text-gray-900">{formData.organization || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current City</p>
            <p className="text-lg font-semibold text-gray-900">{formData.currentCity || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* Budget & Location */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Budget & Location
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Budget Range</p>
            <p className="text-lg font-semibold text-emerald-700">
              ₹{formData.budget?.min || "0"} - ₹{formData.budget?.max || "0"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Preferred City</p>
            <p className="text-lg font-semibold text-gray-900">{formData.preferredCity || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Property Preferences */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          Property Preferences
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Property Type</p>
            <p className="text-lg font-semibold text-gray-900">{formData.propertyType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Furnishing</p>
            <p className="text-lg font-semibold text-gray-900">{formData.furnishingPreference}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">BHK Preference</p>
            <p className="text-lg font-semibold text-gray-900">
              {formData.bhkPreference?.length > 0 ? formData.bhkPreference.map(b => b.toUpperCase()).join(", ") : "No preference"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Move-in Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {formData.moveInDate ? new Date(formData.moveInDate).toLocaleDateString() : "Flexible"}
            </p>
          </div>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Lifestyle
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Food Preference</p>
            <p className="text-lg font-semibold text-gray-900">{formData.foodPreference || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Habits</p>
            <div className="flex gap-2 flex-wrap mt-1">
              {formData.smokingHabit && <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">🚬 Smoker</span>}
              {formData.drinkingHabit && <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">🍺 Drinker</span>}
              {formData.hasPets && <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">🐾 Has Pets</span>}
              {!formData.smokingHabit && !formData.drinkingHabit && !formData.hasPets && (
                <span className="text-gray-500 text-sm">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {formData.requiredAmenities?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Required Amenities
          </h3>
          <div className="flex flex-wrap gap-2">
            {formData.requiredAmenities.map(amenity => (
              <span key={amenity} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {formData.bio && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            About Me
          </h3>
          <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
        </div>
      )}
    </div>
  );

  const totalSteps = 7;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.phoneNumber && formData.age;
      case 2:
        return formData.occupation;
      case 3:
        return formData.budget.min && formData.budget.max && formData.preferredCity;
      default:
        return true;
    }
  };

  const renderStep = () => {
    // ... (keep all your existing step rendering code - cases 1-7)
    // I'll include it all below for completeness
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">Let's start with some basic details about you</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    placeholder="Your age"
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg appearance-none bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      // Cases 2-7 remain exactly the same as your original code
      // (I'm including them for completeness but they're unchanged)
      
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Professional Information</h3>
              <p className="text-gray-600">Tell us about your work or studies</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Student", "Working Professional", "Self-Employed", "Other"].map(occ => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, occupation: occ }))}
                      className={`px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.occupation === occ
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:shadow-md"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.occupation === "Student" ? "College/University Name" : "Company Name"}
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder={formData.occupation === "Student" ? "e.g., IIT Mumbai" : "e.g., Google India"}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current City
                </label>
                <input
                  type="text"
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleInputChange}
                  placeholder="Where do you currently live?"
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Budget & Location</h3>
              <p className="text-gray-600">What's your rental budget and preferred location?</p>
            </div>
            
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Monthly Budget Range <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Minimum (₹)</label>
                    <input
                      type="number"
                      name="budget.min"
                      value={formData.budget.min}
                      onChange={handleInputChange}
                      placeholder="e.g., 10000"
                      className="w-full px-5 py-4 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Maximum (₹)</label>
                    <input
                      type="number"
                      name="budget.max"
                      value={formData.budget.max}
                      onChange={handleInputChange}
                      placeholder="e.g., 20000"
                      className="w-full px-5 py-4 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="preferredCity"
                  value={formData.preferredCity}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai, Bangalore, Delhi"
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Property Preferences</h3>
              <p className="text-gray-600">What type of property are you looking for?</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Property Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Any", "PG", "Shared Flat", "Rented Apartment"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                      className={`px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.propertyType === type
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:shadow-md"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  BHK Preference (Select all that apply)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {["1rk", "1bhk", "2bhk", "3bhk", "4bhk", "shared", "single"].map(bhk => (
                    <button
                      key={bhk}
                      type="button"
                      onClick={() => handleMultiSelect("bhkPreference", bhk)}
                      className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                        formData.bhkPreference?.includes(bhk)
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg"
                          : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500"
                      }`}
                    >
                      {bhk.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Furnishing Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Any", "Fully Furnished", "Semi Furnished", "Unfurnished"].map(furn => (
                    <button
                      key={furn}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, furnishingPreference: furn }))}
                      className={`px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.furnishingPreference === furn
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:shadow-md"
                      }`}
                    >
                      {furn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Move-in Date
                </label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Lifestyle Preferences</h3>
              <p className="text-gray-600">Help us understand your lifestyle better</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Food Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Vegetarian", "Non-Vegetarian", "Vegan", "No Preference"].map(food => (
                    <button
                      key={food}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, foodPreference: food }))}
                      className={`px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.foodPreference === food
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:shadow-md"
                      }`}
                    >
                      {food}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 space-y-4">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="smokingHabit"
                    checked={formData.smokingHabit}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">I smoke</span>
                </label>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="drinkingHabit"
                    checked={formData.drinkingHabit}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">I drink alcohol</span>
                </label>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="hasPets"
                    checked={formData.hasPets}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">I have pets</span>
                </label>
              </div>

              {formData.hasPets && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tell us about your pets
                  </label>
                  <input
                    type="text"
                    name="petDetails"
                    value={formData.petDetails}
                    onChange={handleInputChange}
                    placeholder="e.g., Golden Retriever, 2 years old"
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Required Amenities</h3>
              <p className="text-gray-600">Select the amenities you need in your rental</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "WiFi", icon: "📶" },
                { name: "Power Backup", icon: "⚡" },
                { name: "Lift", icon: "🛗" },
                { name: "Parking", icon: "🚗" },
                { name: "Washing Machine", icon: "🧺" },
                { name: "Fridge", icon: "❄️" },
                { name: "AC", icon: "🌡️" },
                { name: "Geyser", icon: "🚿" },
                { name: "Housekeeping", icon: "🧹" },
                { name: "Security/CCTV", icon: "📹" }
              ].map(amenity => (
                <button
                  key={amenity.name}
                  type="button"
                  onClick={() => handleMultiSelect("requiredAmenities", amenity.name)}
                  className={`px-6 py-5 rounded-xl border-2 font-semibold transition-all text-left flex items-center gap-3 ${
                    formData.requiredAmenities?.includes(amenity.name)
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:shadow-md"
                  }`}
                >
                  <span className="text-2xl">{amenity.icon}</span>
                  <span>{amenity.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">About You</h3>
              <p className="text-gray-600">Tell property owners a bit about yourself</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio (Optional)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell property owners about yourself, your interests, and what kind of living environment you prefer..."
                maxLength="500"
                rows="8"
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  This helps property owners understand if you'd be a good fit
                </p>
                <p className="text-xs text-gray-500">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Almost done!</h4>
                  <p className="text-sm text-gray-600">
                    Once you submit, property owners will be able to see your profile and contact you for suitable rentals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/tenant")}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* ✅ Only show progress in edit mode */}
            {isEditing && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* ✅ Show ProfileView or Form based on mode */}
          {!isEditing && profileExists ? (
            <ProfileView />
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 flex items-center gap-3 animate-fade-in">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-600 flex items-center gap-3 animate-fade-in">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ✅ Profile saved successfully!
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                {renderStep()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg"
                  >
                    ← Previous
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!canProceed()}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span>{profileExists ? "Update Profile" : "Complete Profile"}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TenantProfile;
