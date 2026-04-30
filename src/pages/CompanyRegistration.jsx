import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import {
  Building2, User, Mail, Phone, Users, Globe,
  MapPin, FileText, Upload, Save, Send, Navigation,
  Briefcase, Hash, UserCog, Shield
} from "lucide-react";
import toast from "react-hot-toast";
import { useJsApiLoader, GoogleMap, MarkerF, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = "AIzaSyALDMYAfDXu-dDv5dXd6VuQCJCTsRPG4UY";

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const libraries = useMemo(() => ['places'], []);
  const [loading, setLoading] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast.error("Please sign up or log in to register your company.", { duration: 4000 });
      navigate("/", { state: { showSignup: true } });
    }
    console.log("Google Maps isLoaded:", isLoaded);
  }, [isLoaded, currentUser, authLoading, navigate]);

  if (loadError) {
    console.error("Google Maps Load Error:", loadError);
  }

  const [formData, setFormData] = useState({
    companyName: "",
    adminFullName: "",
    officialEmail: "",
    adminWorkEmail: "",
    managerName: "",
    managerEmail: "",
    phone: "",
    employeeCount: "",
    industry: "",
    website: "",
    streetAddress: "",
    city: "",
    state: "",
    pinCode: "",
    latitude: "",
    longitude: "",
    additionalNotes: "",
  });

  const [autocomplete, setAutocomplete] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const geocodeAddress = (address) => {
    if (!address || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();

        // Extract address components for other fields if they are empty
        const components = results[0].address_components;
        let city = "";
        let state = "";
        let pin = "";

        components.forEach(c => {
          if (c.types.includes("locality")) city = c.long_name;
          if (c.types.includes("administrative_area_level_1")) state = c.long_name;
          if (c.types.includes("postal_code")) pin = c.long_name;
        });

        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
          // Only update these if they are currently empty to avoid overwriting user manual input
          city: prev.city || city,
          state: prev.state || state,
          pinCode: prev.pinCode || pin
        }));

        toast.success("Coordinates synced from manual address!");
      }
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        // If user didn't select from dropdown, try manual geocode of the text
        geocodeAddress(formData.streetAddress);
        return;
      }

      const addressComponents = place.address_components;
      let street = "";
      let city = "";
      let state = "";
      let pin = "";

      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes("street_number") || types.includes("route")) {
          street += (street ? " " : "") + component.long_name;
        }
        if (types.includes("locality")) city = component.long_name;
        if (types.includes("administrative_area_level_1")) state = component.long_name;
        if (types.includes("postal_code")) pin = component.long_name;
      });

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setFormData(prev => ({
        ...prev,
        streetAddress: street || place.formatted_address,
        city,
        state,
        pinCode: pin,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { companyName, adminFullName, officialEmail, managerName, managerEmail } = formData;

    if (!companyName || !adminFullName || !officialEmail || !managerName || !managerEmail) {
      toast.error("Please fill in all required fields (Company Name, Admin Name, Emails, Manager Details)");
      return;
    }

    // Validate manager email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(managerEmail)) {
      toast.error("Please enter a valid manager email address");
      return;
    }

    if (!currentUser) {
      toast.error("Your session has expired. Please log in again.");
      navigate("/");
      return;
    }

    console.log("Submitting Company Data:", formData);

    setLoading(true);
    try {
      await addDoc(collection(db, "companies"), {
        companyName: formData.companyName,
        adminFullName: formData.adminFullName,
        officialEmail: formData.officialEmail,
        adminWorkEmail: formData.adminWorkEmail,
        managerName: formData.managerName,
        managerEmail: formData.managerEmail ? formData.managerEmail.toLowerCase().trim() : "",
        phone: formData.phone,
        employeeCount: formData.employeeCount,
        industry: formData.industry,
        website: formData.website,
        location: {
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        additionalNotes: formData.additionalNotes,
        status: "pending",
        registeredBy: currentUser.uid,
        registeredEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });
      toast.success("Application submitted successfully! We'll review it within 2 business days.");
      setFormData({
        companyName: "",
        adminFullName: "",
        officialEmail: "",
        adminWorkEmail: "",
        managerName: "",
        managerEmail: "",
        phone: "",
        employeeCount: "",
        industry: "",
        website: "",
        streetAddress: "",
        city: "",
        state: "",
        pinCode: "",
        latitude: "",
        longitude: "",
        additionalNotes: "",
      });
    } catch (error) {
      console.error("Firestore Error Details:", error);
      let errorMessage = "Submission failed. ";

      if (error.code === 'permission-denied') {
        errorMessage += "You don't have permission to write to this database. Please contact the administrator.";
      } else if (error.code === 'unavailable') {
        errorMessage += "The database is currently offline. Check your internet connection.";
      } else {
        errorMessage += error.message || "An unknown error occurred.";
      }

      toast.error(errorMessage, { duration: 6000 });
    }
    setLoading(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setLoading(false);
        toast.success("Location coordinates updated!");
      },
      (error) => {
        setLoading(false);
        let msg = "Failed to get location";
        if (error.code === 1) msg = "Please allow location access in your browser settings";
        toast.error(msg);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSaveDraft = () => {
    localStorage.setItem("companyDraft", JSON.stringify(formData));
    toast.success("Draft saved locally!");
  };

  // Automatic Geocoding (Not needed with Autocomplete but kept for manual override)
  // Removed old manual fetch to prevent conflicts with Google Places

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        <div className="registration-page">
          {/* Page Header */}
          <div className="reg-page-header">
            <div>
              <h1>Register Your Company</h1>
              <p>Submit your company details for approval</p>
            </div>
            <div className="draft-badge">
              <FileText size={14} />
              DRAFT
            </div>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            {/* Company & Admin Details */}
            <div className="form-section-grid">
              <div className="form-section">
                <div className="section-title">
                  <Building2 size={18} />
                  <h3>Company Details</h3>
                </div>
                <div className="section-fields">
                  <div className="field-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="e.g. Acme Innovations"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label>Official Email</label>
                      <input
                        type="email"
                        name="officialEmail"
                        placeholder="contact@company.com"
                        value={formData.officialEmail}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="field-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  <User size={18} />
                  <h3>Contact Person</h3>
                </div>
                <div className="section-fields">
                  <div className="field-group">
                    <label>Contact Person Name</label>
                    <input
                      type="text"
                      name="adminFullName"
                      placeholder="e.g. Elena Vance"
                      value={formData.adminFullName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="field-group">
                    <label>Contact Work Email</label>
                    <input
                      type="email"
                      name="adminWorkEmail"
                      placeholder="elena@company.com"
                      value={formData.adminWorkEmail}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Details - KEY SECTION */}
            <div className="form-section full-width manager-section">
              <div className="section-title">
                <Shield size={18} />
                <h3>Manager Details (For Mobile App)</h3>
                <span className="gps-badge important-badge">
                  <UserCog size={12} />
                  Required
                </span>
              </div>
              <div className="manager-info-banner">
                <Shield size={16} />
                <p>
                  The manager will use this email to log into the <strong>mobile app</strong>.
                  They will be able to approve employees, track attendance, and manage the team for this company.
                  Each company's data is <strong>completely isolated</strong> — no other company can access it.
                </p>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Manager Name</label>
                  <input
                    type="text"
                    name="managerName"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.managerName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="field-group">
                  <label>Manager Email (App Login)</label>
                  <input
                    type="email"
                    name="managerEmail"
                    placeholder="manager@company.com"
                    value={formData.managerEmail}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="form-section full-width">
              <div className="section-title">
                <Briefcase size={18} />
                <h3>Company Information</h3>
              </div>
              <div className="field-row three-cols">
                <div className="field-group">
                  <label>No. of Employees</label>
                  <select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="500+">500+ Employees</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    placeholder="e.g. Technology"
                    value={formData.industry}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="field-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://www.company.com"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Company Location */}
            <div className="form-section full-width location-section">
              <div className="location-card">
                <div className="section-title">
                  <MapPin size={18} />
                  <h3>Company Location</h3>
                  <span className="gps-badge">
                    <Navigation size={12} />
                    GPS Enabled
                  </span>
                </div>

                <div className="field-group">
                  <label>Street Address / Search Office</label>
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={onAutocompleteLoad}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <input
                        type="text"
                        name="streetAddress"
                        placeholder="Search for your office building..."
                        value={formData.streetAddress}
                        onChange={handleChange}
                        onBlur={(e) => geocodeAddress(e.target.value)}
                        disabled={loading}
                        className="google-autocomplete-input"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      name="streetAddress"
                      placeholder="Loading Google Maps..."
                      disabled
                    />
                  )}
                </div>

                <div className="field-row three-cols">
                  <div className="field-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Chennai"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="field-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Tamil Nadu"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="field-group">
                    <label>Pin Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      placeholder="600001"
                      value={formData.pinCode}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="field-row coordinates-status-row">
                  <div className="location-status-badge">
                    {formData.latitude && formData.longitude ? (
                      <div className="status-item success">
                        <div className="status-dot"></div>
                        <span>Coordinates Captured: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}</span>
                      </div>
                    ) : (
                      <div className="status-item warning">
                        <div className="status-dot"></div>
                        <span>Location required for geofencing</span>
                      </div>
                    )}
                  </div>
                  <div className="field-group get-location-group">
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="get-location-btn premium-btn"
                      disabled={loading}
                    >
                      <Navigation size={16} />
                      {formData.latitude ? "Refresh GPS" : "Auto-Detect My Position"}
                    </button>
                  </div>
                </div>

                <div className="map-picker-container" style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gray-200)', height: '350px', width: '100%', position: 'relative', zIndex: 1 }}>
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : { lat: 12.9716, lng: 80.2412 }}
                      zoom={17}
                      onClick={handleMapClick}
                      options={{
                        mapTypeControl: true,
                        streetViewControl: false,
                        fullscreenControl: true,
                      }}
                    >
                      {formData.latitude && formData.longitude && (
                        <MarkerF
                          position={{ lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }}
                          draggable={true}
                          onDragEnd={(e) => handleMapClick(e)}
                          animation={google.maps.Animation.DROP}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="map-loading-placeholder">
                      <p>Loading interactive map...</p>
                    </div>
                  )}
                </div>

                <p className="location-note">
                  <MapPin size={12} />
                  Click exactly on your office building on the map above, or use the "Auto Fetch" button if you are physically at the office. This ensures mobile check-ins are perfectly accurate.
                </p>
              </div>
            </div>

            {/* Required Documents */}
            <div className="form-section full-width">
              <div className="section-title">
                <FileText size={18} />
                <h3>Required Documents</h3>
              </div>
              <div className="documents-grid">
                <div className="doc-upload-card">
                  <div className="doc-icon">
                    <FileText size={24} />
                  </div>
                  <span className="doc-title">Business Registration</span>
                  <span className="doc-desc">PDF or PNG (Max 5MB)</span>
                </div>
                <div className="doc-upload-card">
                  <div className="doc-icon">
                    <Briefcase size={24} />
                  </div>
                  <span className="doc-title">ID Proof</span>
                  <span className="doc-desc">Passport or License</span>
                </div>
                <div className="doc-upload-card">
                  <div className="doc-icon">
                    <MapPin size={24} />
                  </div>
                  <span className="doc-title">Address Proof</span>
                  <span className="doc-desc">Utility Bill or Lease</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="form-section full-width">
              <label className="notes-label">Additional Notes</label>
              <textarea
                name="additionalNotes"
                placeholder="Mention any specific requirements or details for the approval team..."
                value={formData.additionalNotes}
                onChange={handleChange}
                disabled={loading}
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-draft"
                onClick={handleSaveDraft}
                disabled={loading}
              >
                <Save size={16} />
                Save as Draft
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner"></span>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
