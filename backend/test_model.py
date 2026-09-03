import pickle

path = "assets/xgb_model.dat"

try:
    with open(path, "rb") as f:
        model = pickle.load(f)

    print("✅ Model loaded successfully")
    print("Type:", type(model))

    if hasattr(model, "n_features_in_"):
        print("Features expected:", model.n_features_in_)

    if hasattr(model, "classes_"):
        print("Classes:", model.classes_)

except Exception as e:
    print("❌ Load failed")
    print("Error:", e)