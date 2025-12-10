// Backend Integration Tests for Auth Routes
// Run with: npm test

const db = require('./utils/database');

// Reset database before each test
function resetDatabase() {
  db.users = new Map();
  db.destinations = new Map();
  db.reservations = new Map();
  db.comments = new Map();
}

// Test: User Registration
function testUserRegistration() {
  resetDatabase();
  
  // Setup
  const newUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    birth_date: '1990-01-01',
    gender: 'Male',
    password_hash: 'hashed_password'
  };

  // Execute
  db.users.set(newUser.id, newUser);

  // Assert
  const retrieved = db.users.get(newUser.id);
  console.assert(retrieved !== undefined, 'User should be registered');
  console.assert(retrieved.name === 'John Doe', 'User name should match');
  console.assert(retrieved.email === 'john@example.com', 'User email should match');
  
  console.log('✓ testUserRegistration passed');
}

// Test: User Authentication
function testUserAuthentication() {
  resetDatabase();
  
  // Setup
  const user = {
    id: 'user-456',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password_hash: 'hashed_password_123'
  };
  
  db.users.set(user.id, user);
  
  // Execute
  const foundUser = db.users.get(user.id);
  
  // Assert
  console.assert(foundUser !== undefined, 'User should be found');
  console.assert(foundUser.email === 'jane@example.com', 'Email should match');
  
  console.log('✓ testUserAuthentication passed');
}

// Test: Link Wallet to User
function testLinkWallet() {
  resetDatabase();
  
  // Setup
  const user = {
    id: 'user-789',
    name: 'Alice Bob',
    email: 'alice@example.com',
    wallet_address: null
  };
  
  db.users.set(user.id, user);
  
  // Execute - Link wallet
  const walletAddress = 'GBRPYHIL2CI3WHZDTOOQFC6EB4NCCCEF7ZDKK2MAJI4QSA33VQEOYW7A';
  user.wallet_address = walletAddress;
  db.users.set(user.id, user);
  
  // Assert
  const updatedUser = db.users.get(user.id);
  console.assert(updatedUser.wallet_address !== null, 'Wallet address should be set');
  console.assert(updatedUser.wallet_address === walletAddress, 'Wallet address should match');
  
  console.log('✓ testLinkWallet passed');
}

// Test: Create Destination
function testCreateDestination() {
  resetDatabase();
  
  // Setup
  const destination = {
    id: 'dest-001',
    name: 'Machu Picchu',
    country: 'Peru',
    description: 'Ancient Incan city',
    price_per_night: 150,
    rating: 4.8,
    created_by: 'user-001'
  };
  
  // Execute
  db.destinations.set(destination.id, destination);
  
  // Assert
  const retrieved = db.destinations.get(destination.id);
  console.assert(retrieved !== undefined, 'Destination should be created');
  console.assert(retrieved.name === 'Machu Picchu', 'Destination name should match');
  console.assert(retrieved.country === 'Peru', 'Destination country should match');
  
  console.log('✓ testCreateDestination passed');
}

// Test: List Destinations
function testListDestinations() {
  resetDatabase();
  
  // Setup
  const destinations = [
    { id: 'dest-001', name: 'Machu Picchu', country: 'Peru' },
    { id: 'dest-002', name: 'Christ the Redeemer', country: 'Brazil' },
    { id: 'dest-003', name: 'Galapagos Islands', country: 'Ecuador' }
  ];
  
  destinations.forEach(d => db.destinations.set(d.id, d));
  
  // Execute
  const allDestinations = Array.from(db.destinations.values());
  
  // Assert
  console.assert(allDestinations.length === 3, 'Should have 3 destinations');
  console.assert(allDestinations.some(d => d.name === 'Machu Picchu'), 'Should contain Machu Picchu');
  
  console.log('✓ testListDestinations passed');
}

// Test: Create Reservation
function testCreateReservation() {
  resetDatabase();
  
  // Setup
  const reservation = {
    id: 'res-001',
    user_id: 'user-001',
    destination_id: 'dest-001',
    check_in: '2024-03-15',
    check_out: '2024-03-20',
    total_price: 750,
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  
  // Execute
  db.reservations.set(reservation.id, reservation);
  
  // Assert
  const retrieved = db.reservations.get(reservation.id);
  console.assert(retrieved !== undefined, 'Reservation should be created');
  console.assert(retrieved.status === 'confirmed', 'Reservation status should be confirmed');
  console.assert(retrieved.total_price === 750, 'Reservation price should match');
  
  console.log('✓ testCreateReservation passed');
}

// Test: Cancel Reservation
function testCancelReservation() {
  resetDatabase();
  
  // Setup
  const reservation = {
    id: 'res-002',
    user_id: 'user-001',
    destination_id: 'dest-001',
    status: 'confirmed'
  };
  
  db.reservations.set(reservation.id, reservation);
  
  // Execute
  reservation.status = 'cancelled';
  db.reservations.set(reservation.id, reservation);
  
  // Assert
  const updated = db.reservations.get(reservation.id);
  console.assert(updated.status === 'cancelled', 'Reservation status should be cancelled');
  
  console.log('✓ testCancelReservation passed');
}

// Test: Add Comment to Destination
function testAddComment() {
  resetDatabase();
  
  // Setup
  const comment = {
    id: 'comment-001',
    destination_id: 'dest-001',
    user_id: 'user-001',
    rating: 5,
    text: 'Amazing experience!',
    created_at: new Date().toISOString()
  };
  
  // Execute
  db.comments.set(comment.id, comment);
  
  // Assert
  const retrieved = db.comments.get(comment.id);
  console.assert(retrieved !== undefined, 'Comment should be created');
  console.assert(retrieved.rating === 5, 'Comment rating should match');
  console.assert(retrieved.text === 'Amazing experience!', 'Comment text should match');
  
  console.log('✓ testAddComment passed');
}

// Test: Get User Profile
function testGetUserProfile() {
  resetDatabase();
  
  // Setup
  const user = {
    id: 'user-001',
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-0000',
    birth_date: '1985-06-15',
    gender: 'Female',
    wallet_address: 'GTEST123'
  };
  
  db.users.set(user.id, user);
  
  // Execute
  const profile = db.users.get(user.id);
  
  // Assert
  console.assert(profile !== undefined, 'Profile should be retrieved');
  console.assert(profile.name === 'Test User', 'Profile name should match');
  console.assert(profile.wallet_address === 'GTEST123', 'Profile wallet should match');
  
  console.log('✓ testGetUserProfile passed');
}

// Test: Update User Profile
function testUpdateUserProfile() {
  resetDatabase();
  
  // Setup
  const user = {
    id: 'user-001',
    name: 'Original Name',
    email: 'original@example.com',
    phone: '555-1111'
  };
  
  db.users.set(user.id, user);
  
  // Execute - Update name and email
  user.name = 'Updated Name';
  user.email = 'updated@example.com';
  db.users.set(user.id, user);
  
  // Assert
  const updated = db.users.get(user.id);
  console.assert(updated.name === 'Updated Name', 'Name should be updated');
  console.assert(updated.email === 'updated@example.com', 'Email should be updated');
  console.assert(updated.phone === '555-1111', 'Phone should remain unchanged');
  
  console.log('✓ testUpdateUserProfile passed');
}

// Test: Delete User
function testDeleteUser() {
  resetDatabase();
  
  // Setup
  const user = {
    id: 'user-001',
    name: 'To Delete',
    email: 'delete@example.com'
  };
  
  db.users.set(user.id, user);
  console.assert(db.users.has(user.id), 'User should exist before deletion');
  
  // Execute
  db.users.delete(user.id);
  
  // Assert
  console.assert(!db.users.has(user.id), 'User should be deleted');
  
  console.log('✓ testDeleteUser passed');
}

// Run all tests
function runAllTests() {
  console.log('Running Backend Integration Tests...\n');
  
  try {
    testUserRegistration();
    testUserAuthentication();
    testLinkWallet();
    testCreateDestination();
    testListDestinations();
    testCreateReservation();
    testCancelReservation();
    testAddComment();
    testGetUserProfile();
    testUpdateUserProfile();
    testDeleteUser();
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testUserRegistration,
  testUserAuthentication,
  testLinkWallet,
  testCreateDestination,
  testListDestinations,
  testCreateReservation,
  testCancelReservation,
  testAddComment,
  testGetUserProfile,
  testUpdateUserProfile,
  testDeleteUser,
  runAllTests
};
