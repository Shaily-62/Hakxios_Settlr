import mongoose from "mongoose";

const tenantProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: String,  // ✅ Changed to String for Firebase UID
            required: true,
            unique: true,
            index: true
        },

        // Personal Information
        age: {
            type: Number,
            min: 18,
            max: 100
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other", "Prefer not to say"]
        },

        phoneNumber: {
            type: String,
            required: true
        },

        // Professional Information
        occupation: {
            type: String,
            enum: ["Student", "Working Professional", "Self-Employed", "Other"],
            required: true
        },

        organization: {
            type: String  // College/Company name
        },

        currentCity: {
            type: String
        },

        // Rental Preferences
        budget: {
            min: {
                type: Number,
                required: true
            },
            max: {
                type: Number,
                required: true
            }
        },

        preferredCity: {
            type: String,
            required: true
        },

        preferredLocations: [{
            type: String  // Specific areas within city
        }],

        propertyType: {
            type: String,
            enum: ["PG", "Shared Flat", "Rented Apartment", "Any"],
            default: "Any"
        },

        bhkPreference: [{
            type: String,
            enum: ["1rk", "1bhk", "2bhk", "3bhk", "4bhk", "shared", "single"]
        }],

        furnishingPreference: {
            type: String,
            enum: ["Fully Furnished", "Semi Furnished", "Unfurnished", "Any"],
            default: "Any"
        },

        moveInDate: {
            type: Date
        },

        // Lifestyle & Preferences
        foodPreference: {
            type: String,
            enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "No Preference"]
        },

        smokingHabit: {
            type: Boolean,
            default: false
        },

        drinkingHabit: {
            type: Boolean,
            default: false
        },

        hasPets: {
            type: Boolean,
            default: false
        },

        petDetails: {
            type: String  // If hasPets is true
        },

        // Required Amenities (multi-select)
        requiredAmenities: [{
            type: String,
            enum: [
                "WiFi",
                "Power Backup",
                "Lift",
                "Parking",
                "Washing Machine",
                "Fridge",
                "AC",
                "Geyser",
                "Housekeeping",
                "Security/CCTV"
            ]
        }],

        // Additional Information
        bio: {
            type: String,
            maxlength: 500
        },

        occupationProof: {
            type: String  // URL to uploaded document
        },

        idProof: {
            type: String  // URL to uploaded document
        },

        profileCompleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Index for faster queries
tenantProfileSchema.index({ preferredCity: 1 });
tenantProfileSchema.index({ 'budget.min': 1, 'budget.max': 1 });

export default mongoose.model("TenantProfile", tenantProfileSchema);
