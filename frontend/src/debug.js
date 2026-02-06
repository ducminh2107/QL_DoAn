// Debugger script - chạy trong browser Console
console.log("🔍 =========== DEBUGGING UNAUTHORIZED ISSUE ===========");

// 1. Check localStorage
console.log("\n1️⃣ Checking localStorage:");
const token = localStorage.getItem("token");
console.log("   Token exists:", !!token);
if (token) {
  console.log("   Token length:", token.length);
  console.log("   Token preview:", token.substring(0, 50) + "...");
}

// 2. Suggest clear cache
console.log("\n2️⃣ To clear cache and test again, run:");
console.log("   localStorage.clear()");
console.log("   sessionStorage.clear()");
console.log("   location.reload()");

// 3. Info to collect
console.log("\n3️⃣ After login, check these logs in Console:");
console.log("   - Look for: '🔍 User loaded from API'");
console.log("   - Look for: '🔐 ProtectedRoute Check'");
console.log("   - Look for: 'User role: ...' (should be 'teacher')");

console.log("\n🔍 =========== END DEBUG INFO ===========");
