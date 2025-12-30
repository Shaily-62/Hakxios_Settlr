import TenantProfile from "../models/TenantProfile.js";

export const createOrUpdateTenant = async (req, res) => {
    try {
        const userId = req.user.uid;  // ✅ Use Firebase UID

        console.log('📝 Creating/Updating tenant profile for:', userId);
        console.log('📦 Request body:', req.body);

        const {
            age,
            gender,
            phoneNumber,
            occupation,
            organization,
            currentCity,
            budget,
            preferredCity,
            preferredLocations,
            propertyType,
            bhkPreference,
            furnishingPreference,
            moveInDate,
            foodPreference,
            smokingHabit,
            drinkingHabit,
            hasPets,
            petDetails,
            requiredAmenities,
            bio,
            occupationProof,
            idProof
        } = req.body;

        // Calculate profile completion
        const requiredFields = [phoneNumber, occupation, budget, preferredCity];
        const profileCompleted = requiredFields.every(field => field !== undefined && field !== null);

        const tenant = await TenantProfile.findOneAndUpdate(
            { userId },
            {
                userId,
                age,
                gender,
                phoneNumber,
                occupation,
                organization,
                currentCity,
                budget,
                preferredCity,
                preferredLocations,
                propertyType,
                bhkPreference,
                furnishingPreference,
                moveInDate,
                foodPreference,
                smokingHabit,
                drinkingHabit,
                hasPets,
                petDetails,
                requiredAmenities,
                bio,
                occupationProof,
                idProof,
                profileCompleted
            },
            { new: true, upsert: true, runValidators: true }
        );

        console.log('✅ Tenant profile saved:', tenant._id);

        res.status(200).json({
            message: "Profile updated successfully",
            tenant
        });
    } catch (error) {
        console.error('❌ Error saving tenant profile:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getTenantProfile = async (req, res) => {
    try {
        const userId = req.user.uid;  // ✅ Use Firebase UID

        console.log('🔍 Fetching tenant profile for:', userId);

        const tenant = await TenantProfile.findOne({ userId });

        if (!tenant) {
            console.log('❌ Tenant profile not found');
            return res.status(404).json({ 
                message: "Tenant profile not found",
                profileExists: false
            });
        }

        console.log('✅ Tenant profile found:', tenant._id);

        res.status(200).json({
            profileExists: true,
            tenant
        });
    } catch (error) {
        console.error('❌ Error fetching tenant profile:', error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ NEW: Get all tenants (for admin/owner)
export const getAllTenants = async (req, res) => {
    try {
        const { city, minBudget, maxBudget, occupation } = req.query;

        let query = { profileCompleted: true };

        if (city) query.preferredCity = new RegExp(city, 'i');
        if (occupation) query.occupation = occupation;
        if (minBudget || maxBudget) {
            query['budget.min'] = {};
            if (minBudget) query['budget.min'].$gte = Number(minBudget);
            if (maxBudget) query['budget.max'].$lte = Number(maxBudget);
        }

        const tenants = await TenantProfile.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            count: tenants.length,
            tenants
        });
    } catch (error) {
        console.error('❌ Error fetching tenants:', error);
        res.status(500).json({ message: error.message });
    }
};
