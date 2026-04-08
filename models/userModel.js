import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
        message: props => `${props.value} is not a valid email!`
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, 'Password must be at least 6 characters']
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    // Added address fields to match order requirements
    addresses: [{
      name: String,
      phone: {
        type: String,
        validate: {
          validator: (v) => /^[0-9]{10,15}$/.test(v),
          message: props => `${props.value} is not a valid phone number!`
        }
      },
      street: String,
      city: String,
      isDefault: Boolean
    }],
    phone: String, // Main contact number
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ is_active: 1 });
userSchema.index({ role: 1 });

// Password hashing (keeping your existing implementation)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password validation (keeping your existing method)
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// New method to get default address
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

export default mongoose.model("User", userSchema);