# Smart Resource Optimizer (SRO) - Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Laravel 11 API foundation including Authentication (Sanctum), User Roles, and Profile Verification.

**Architecture:** Laravel 11 Headless API with Sanctum. Uses the "Action" pattern to encapsulate business logic (e.g., RegisterUserAction, VerifyUserAction).

**Tech Stack:** Laravel 11, PHP 8.2+, MySQL 8.0, Laravel Sanctum, Pest PHP (Testing).

---

### Task 1: Initialize Laravel Project & Setup Sanctum

**Files:**
- Modify: `.env`
- Modify: `config/auth.php`

- [ ] **Step 1: Install Sanctum**
Run: `php artisan install:api`
Expected: API scaffolding and Sanctum migrations created.

- [ ] **Step 2: Configure Database**
Update `.env` with MySQL credentials and `DB_DATABASE=smart_resource_optimizer`.

- [ ] **Step 3: Run Migrations**
Run: `php artisan migrate`

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: initialize laravel api and sanctum"
```

---

### Task 2: User Model & Role Migration

**Files:**
- Modify: `database/migrations/0001_01_01_000000_create_users_table.php`
- Modify: `app/Models/User.php`

- [ ] **Step 1: Add role column to users table**
```php
// In migration
$table->enum('role', ['admin', 'restaurant', 'community'])->default('community');
```

- [ ] **Step 2: Update User Model**
```php
protected $fillable = ['name', 'email', 'password', 'role'];

public function isRestaurant(): bool { return $this->role === 'restaurant'; }
public function isCommunity(): bool { return $this->role === 'community'; }
public function isAdmin(): bool { return $this->role === 'admin'; }
```

- [ ] **Step 3: Run Migrations**
Run: `php artisan migrate:fresh`

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: add role to user model"
```

---

### Task 3: Profiles Table & Verification Logic

**Files:**
- Create: `database/migrations/xxxx_xx_xx_create_profiles_table.php`
- Create: `app/Models/Profile.php`
- Modify: `app/Models/User.php`

- [ ] **Step 1: Create Profiles Migration**
```php
$table->foreignId('user_id')->constrained()->onDelete('cascade');
$table->string('name');
$table->text('address');
$table->decimal('lat', 10, 8)->nullable();
$table->decimal('long', 11, 8)->nullable();
$table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
$table->string('document_url')->nullable();
```

- [ ] **Step 2: Define Relationships**
In `User.php`: `public function profile() { return $this->hasOne(Profile::class); }`
In `Profile.php`: `protected $fillable = ['user_id', 'name', 'address', 'lat', 'long', 'verification_status', 'document_url'];`

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: create profiles table for verification"
```

---

### Task 4: Registration Action & API Endpoint

**Files:**
- Create: `app/Actions/Auth/RegisterUserAction.php`
- Create: `app/Http/Controllers/Api/AuthController.php`
- Modify: `routes/api.php`
- Test: `tests/Feature/Auth/RegistrationTest.php`

- [ ] **Step 1: Write Registration Test**
```php
it('can register a new user with profile', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Restoran Enak',
        'email' => 'restoran@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'restaurant',
        'address' => 'Jl. Kebagusan No 1',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['email' => 'restoran@test.com']);
    $this->assertDatabaseHas('profiles', ['name' => 'Restoran Enak']);
});
```

- [ ] **Step 2: Implement RegisterUserAction**
Handle User and Profile creation in one transaction.

- [ ] **Step 3: Implement AuthController & Route**
```php
public function register(Request $request, RegisterUserAction $action) {
    // validation...
    $user = $action->execute($request->all());
    return response()->json(['token' => $user->createToken('api')->plainTextToken], 201);
}
```

- [ ] **Step 4: Run Tests**
Run: `php artisan test`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: implement registration with profile"
```

---

### Task 5: Admin Verification Endpoint

**Files:**
- Create: `app/Actions/Admin/VerifyUserAction.php`
- Create: `app/Http/Controllers/Api/AdminController.php`
- Modify: `routes/api.php`
- Test: `tests/Feature/Admin/VerificationTest.php`

- [ ] **Step 1: Write Verification Test**
Ensure only admins can verify users.

- [ ] **Step 2: Implement VerifyUserAction**
Update `verification_status` of the profile.

- [ ] **Step 3: Implement Route with Admin Middleware**
```php
Route::middleware(['auth:sanctum', 'can:admin-only'])->group(function () {
    Route::patch('/admin/verify/{user}', [AdminController::class, 'verify']);
});
```

- [ ] **Step 4: Run Tests**
Run: `php artisan test`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: implement admin verification endpoint"
```
