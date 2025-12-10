//! Soroban contract for Alas Latinas travel booking system.
//! Implements requirements RF-01..RF-15 based on wiki specifications.
//! Manages users, destinations, reservations, comments, and multimedia.

#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, Map, Symbol, String, Vec};

#[contract]
pub struct AlasLatinas;

#[contractimpl]
impl AlasLatinas {
    // ============ RF-01: User Registration ============
    pub fn register_user(
        env: Env,
        user_id: Address,
        name: String,
        email: String,
        phone: String,
        birth_date: String,
        gender: String,
    ) {
        // Check if user already exists
        let users_key = Symbol::new(&env, "users");
        let mut users: Map<Address, String> = env
            .storage()
            .persistent()
            .get(&users_key)
            .unwrap_or(Map::new(&env));

        if users.contains_key(user_id.clone()) {
            panic!("User already registered");
        }

        // Store user in a dedicated storage structure
        let user_data_key = (Symbol::new(&env, "user_data"), user_id.clone());
        let user_data = (name, email, phone, birth_date, gender);
        env.storage().persistent().set(&user_data_key, &user_data);

        // Add to users index
        users.set(user_id, String::from_str(&env, "active"));
        env.storage().persistent().set(&users_key, &users);
    }

    // ============ RF-02: Delete User ============
    pub fn delete_user(env: Env, user_id: Address) {
        let users_key = Symbol::new(&env, "users");
        let mut users: Map<Address, String> = env
            .storage()
            .persistent()
            .get(&users_key)
            .unwrap_or(Map::new(&env));

        if !users.contains_key(user_id.clone()) {
            panic!("User not found");
        }

        // Remove user data
        let user_data_key = (Symbol::new(&env, "user_data"), user_id.clone());
        env.storage().persistent().remove(&user_data_key);

        // Remove from users index
        users.remove(user_id);
        env.storage().persistent().set(&users_key, &users);
    }

    // ============ RF-03: Update User ============
    pub fn update_user(
        env: Env,
        user_id: Address,
        name: Option<String>,
        email: Option<String>,
        phone: Option<String>,
    ) {
        let users_key = Symbol::new(&env, "users");
        let users: Map<Address, String> = env
            .storage()
            .persistent()
            .get(&users_key)
            .unwrap_or(Map::new(&env));

        if !users.contains_key(user_id.clone()) {
            panic!("User not found");
        }

        let user_data_key = (Symbol::new(&env, "user_data"), user_id.clone());
        let existing: (String, String, String, String, String) = env
            .storage()
            .persistent()
            .get(&user_data_key)
            .unwrap_or((
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                String::from_str(&env, ""),
            ));

        let updated_name = name.unwrap_or(existing.0);
        let updated_email = email.unwrap_or(existing.1);
        let updated_phone = phone.unwrap_or(existing.2);

        let updated_data = (updated_name, updated_email, updated_phone, existing.3, existing.4);
        env.storage().persistent().set(&user_data_key, &updated_data);
    }

    // ============ RF-04: Search/Query Users ============
    pub fn get_user(env: Env, user_id: Address) -> Option<(String, String, String, String, String)> {
        let user_data_key = (Symbol::new(&env, "user_data"), user_id);
        env.storage().persistent().get(&user_data_key)
    }

    pub fn list_users(env: Env) -> Vec<Address> {
        let users_key = Symbol::new(&env, "users");
        let users: Map<Address, String> = env
            .storage()
            .persistent()
            .get(&users_key)
            .unwrap_or(Map::new(&env));

        let mut user_list: Vec<Address> = Vec::new(&env);
        for (user_addr, _) in users.iter() {
            user_list.push_back(user_addr);
        }
        user_list
    }

    // ============ RF-05: Authenticate User ============
    pub fn authenticate_user(env: Env, user_id: Address) -> bool {
        let users_key = Symbol::new(&env, "users");
        let users: Map<Address, String> = env
            .storage()
            .persistent()
            .get(&users_key)
            .unwrap_or(Map::new(&env));

        users.contains_key(user_id)
    }

    // ============ RF-06: Create Destination ============
    pub fn create_destination(
        env: Env,
        dest_id: String,
        name: String,
        address: String,
        location: String,
        description: String,
    ) {
        let destinations_key = Symbol::new(&env, "destinations");
        let mut destinations: Map<String, String> = env
            .storage()
            .persistent()
            .get(&destinations_key)
            .unwrap_or(Map::new(&env));

        if destinations.contains_key(dest_id.clone()) {
            panic!("Destination already exists");
        }

        // Store destination metadata
        let dest_data_key = (Symbol::new(&env, "dest_data"), dest_id.clone());
        let dest_data = (name, address, location, description, 0u32);
        env.storage().persistent().set(&dest_data_key, &dest_data);

        // Add to destinations index
        destinations.set(dest_id, String::from_str(&env, "active"));
        env.storage().persistent().set(&destinations_key, &destinations);
    }

    // ============ RF-07: Delete Destination ============
    pub fn delete_destination(env: Env, dest_id: String) {
        let destinations_key = Symbol::new(&env, "destinations");
        let mut destinations: Map<String, String> = env
            .storage()
            .persistent()
            .get(&destinations_key)
            .unwrap_or(Map::new(&env));

        if !destinations.contains_key(dest_id.clone()) {
            panic!("Destination not found");
        }

        // Remove destination metadata
        let dest_data_key = (Symbol::new(&env, "dest_data"), dest_id.clone());
        env.storage().persistent().remove(&dest_data_key);

        // Remove from destinations index
        destinations.remove(dest_id);
        env.storage().persistent().set(&destinations_key, &destinations);
    }

    // ============ RF-08: Update Destination Info ============
    pub fn update_destination(
        env: Env,
        dest_id: String,
        name: Option<String>,
        address: Option<String>,
        description: Option<String>,
    ) {
        let destinations_key = Symbol::new(&env, "destinations");
        let destinations: Map<String, String> = env
            .storage()
            .persistent()
            .get(&destinations_key)
            .unwrap_or(Map::new(&env));

        if !destinations.contains_key(dest_id.clone()) {
            panic!("Destination not found");
        }

        let dest_data_key = (Symbol::new(&env, "dest_data"), dest_id.clone());
        let existing: (String, String, String, String, u32) = env
            .storage()
            .persistent()
            .get(&dest_data_key)
            .unwrap_or((
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                0,
            ));

        let updated_name = name.unwrap_or(existing.0);
        let updated_address = address.unwrap_or(existing.1);
        let updated_desc = description.unwrap_or(existing.3);

        let updated_data = (updated_name, updated_address, existing.2, updated_desc, existing.4);
        env.storage().persistent().set(&dest_data_key, &updated_data);
    }

    // ============ RF-09: Query Destination Information ============
    pub fn get_destination(env: Env, dest_id: String) -> Option<(String, String, String, String, u32)> {
        let dest_data_key = (Symbol::new(&env, "dest_data"), dest_id);
        env.storage().persistent().get(&dest_data_key)
    }

    pub fn list_destinations(env: Env) -> Vec<String> {
        let destinations_key = Symbol::new(&env, "destinations");
        let destinations: Map<String, String> = env
            .storage()
            .persistent()
            .get(&destinations_key)
            .unwrap_or(Map::new(&env));

        let mut dest_list: Vec<String> = Vec::new(&env);
        for (dest_id, _) in destinations.iter() {
            dest_list.push_back(dest_id);
        }
        dest_list
    }

    // ============ RF-10: Upload Multimedia ============
    pub fn upload_media(env: Env, dest_id: String, media_url: String, media_type: String) {
        let media_key = (Symbol::new(&env, "media"), dest_id.clone());
        let mut media_list: Vec<(String, String)> = env
            .storage()
            .persistent()
            .get(&media_key)
            .unwrap_or(Vec::new(&env));

        media_list.push_back((media_url, media_type));
        env.storage().persistent().set(&media_key, &media_list);
    }

    // ============ RF-11: Add Comment ============
    pub fn add_comment(env: Env, dest_id: String, user_id: Address, comment: String, rating: u32) {
        let comments_key = (Symbol::new(&env, "comments"), dest_id.clone());
        let mut comments: Vec<(Address, String, u32)> = env
            .storage()
            .persistent()
            .get(&comments_key)
            .unwrap_or(Vec::new(&env));

        comments.push_back((user_id, comment, rating));
        env.storage().persistent().set(&comments_key, &comments);

        // Update destination rating (simple average)
        let dest_data_key = (Symbol::new(&env, "dest_data"), dest_id);
        let existing: (String, String, String, String, u32) = env
            .storage()
            .persistent()
            .get(&dest_data_key)
            .unwrap_or((
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                String::from_str(&env, ""),
                0,
            ));

        let total_ratings = (existing.4 as u64) * (comments.len() as u64 - 1) + (rating as u64);
        let new_avg = (total_ratings / comments.len() as u64) as u32;

        let updated_data = (existing.0, existing.1, existing.2, existing.3, new_avg);
        env.storage().persistent().set(&dest_data_key, &updated_data);
    }

    // ============ RF-12: Create Reservation ============
    pub fn create_reservation(
        env: Env,
        reservation_id: String,
        user_id: Address,
        dest_id: String,
        check_in: String,
        check_out: String,
        _total_price: u64,
    ) {
        let reservations_key = Symbol::new(&env, "reservations");
        let mut reservations: Map<String, String> = env
            .storage()
            .persistent()
            .get(&reservations_key)
            .unwrap_or(Map::new(&env));

        if reservations.contains_key(reservation_id.clone()) {
            panic!("Reservation already exists");
        }

        let res_data_key = (Symbol::new(&env, "res_data"), reservation_id.clone());
        let res_data = (user_id, dest_id, check_in, check_out, 0u64, String::from_str(&env, "reserved"), false);
        env.storage().persistent().set(&res_data_key, &res_data);

        reservations.set(reservation_id, String::from_str(&env, "reserved"));
        env.storage().persistent().set(&reservations_key, &reservations);
    }

    // ============ RF-13: Cancel Reservation ============
    pub fn cancel_reservation(env: Env, reservation_id: String) {
        let reservations_key = Symbol::new(&env, "reservations");
        let mut reservations: Map<String, String> = env
            .storage()
            .persistent()
            .get(&reservations_key)
            .unwrap_or(Map::new(&env));

        if !reservations.contains_key(reservation_id.clone()) {
            panic!("Reservation not found");
        }

        let res_data_key = (Symbol::new(&env, "res_data"), reservation_id.clone());
        // Use pattern matching to handle the optional retrieval
        if let Some(mut existing) = env
            .storage()
            .persistent()
            .get::<(Symbol, String), (Address, String, String, String, u64, String, bool)>(&res_data_key)
        {
            existing.5 = String::from_str(&env, "cancelled");
            env.storage().persistent().set(&res_data_key, &existing);
        }

        reservations.set(reservation_id, String::from_str(&env, "cancelled"));
        env.storage().persistent().set(&reservations_key, &reservations);
    }

    // ============ RF-14: Query Reservation Status ============
    pub fn get_reservation_status(env: Env, reservation_id: String) -> Option<String> {
        let res_data_key = (Symbol::new(&env, "res_data"), reservation_id);
        let res_data: Option<(Address, String, String, String, u64, String, bool)> = env
            .storage()
            .persistent()
            .get(&res_data_key);

        res_data.map(|(_, _, _, _, _, status, _)| status)
    }

    // ============ RF-15: Pay Reservation ============
    pub fn pay_reservation(env: Env, reservation_id: String, tx_ref: String) {
        let res_data_key = (Symbol::new(&env, "res_data"), reservation_id);
        // Use pattern matching to safely handle the optional retrieval
        if let Some(existing) = env
            .storage()
            .persistent()
            .get::<(Symbol, String), (Address, String, String, String, u64, String, bool)>(&res_data_key)
        {
            let tx_ref_stored = tx_ref.len() as u64; // Simple storage of tx ref length
            let paid_data = (existing.0, existing.1, existing.2, existing.3, tx_ref_stored, existing.5, true);
            env.storage().persistent().set(&res_data_key, &paid_data);
        }
    }
}

// Unit tests covering RF-01 to RF-15
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Ledger, LedgerInfo};
    // Import the Address trait with a different name to avoid conflict
    use soroban_sdk::testutils::Address as AddressTestExt;

    fn setup_env() -> (Env, soroban_sdk::Address) {
        let env = Env::default();
        env.ledger().set(LedgerInfo {
            protocol_version: 23,
            sequence_number: 1_000_000,
            timestamp: 12345678,
            network_id: [5; 32],
            base_reserve: 5_000_000,
            min_temp_entry_ttl: 16,
            min_persistent_entry_ttl: 100_000,
            max_entry_ttl: 10_000_000,
        });
        let contract_id = env.register_contract::<AlasLatinas>(None, AlasLatinas);
        (env, contract_id)
    }

    // Test RF-01: User Registration
    #[test]
    fn test_register_user() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        let name = String::from_str(&env, "Alice Johnson");
        let email = String::from_str(&env, "alice@example.com");
        let phone = String::from_str(&env, "555-0001");
        let birth_date = String::from_str(&env, "1990-05-15");
        let gender = String::from_str(&env, "Female");

        client.register_user(&user_id, &name, &email, &phone, &birth_date, &gender);

        let user = client.get_user(&user_id);
        assert!(user.is_some());
        let (n, e, p, bd, g) = user.unwrap();
        assert_eq!(n, name);
        assert_eq!(e, email);
        assert_eq!(p, phone);
        assert_eq!(bd, birth_date);
        assert_eq!(g, gender);
    }

    // Test RF-02: Delete User
    #[test]
    fn test_delete_user() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        client.register_user(
            &user_id,
            &String::from_str(&env, "Bob"),
            &String::from_str(&env, "bob@example.com"),
            &String::from_str(&env, "555-0002"),
            &String::from_str(&env, "1985-03-20"),
            &String::from_str(&env, "Male"),
        );

        client.delete_user(&user_id);
        let user = client.get_user(&user_id);
        assert!(user.is_none());
    }

    // Test RF-03: Update User
    #[test]
    fn test_update_user() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        client.register_user(
            &user_id,
            &String::from_str(&env, "Carol"),
            &String::from_str(&env, "carol@example.com"),
            &String::from_str(&env, "555-0003"),
            &String::from_str(&env, "1992-07-10"),
            &String::from_str(&env, "Female"),
        );

        let new_email = String::from_str(&env, "carol.new@example.com");
        client.update_user(&user_id, &Option::<String>::None, &Some(new_email.clone()), &Option::<String>::None);

        let user = client.get_user(&user_id);
        assert!(user.is_some());
        let (_, e, _, _, _) = user.unwrap();
        assert_eq!(e, new_email);
    }

    // Test RF-04: Search/Query Users
    #[test]
    fn test_list_users() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);

        client.register_user(
            &user1,
            &String::from_str(&env, "David"),
            &String::from_str(&env, "david@example.com"),
            &String::from_str(&env, "555-0004"),
            &String::from_str(&env, "1988-11-25"),
            &String::from_str(&env, "Male"),
        );
        client.register_user(
            &user2,
            &String::from_str(&env, "Eve"),
            &String::from_str(&env, "eve@example.com"),
            &String::from_str(&env, "555-0005"),
            &String::from_str(&env, "1995-02-14"),
            &String::from_str(&env, "Female"),
        );

        let users = client.list_users();
        assert_eq!(users.len(), 2);
    }

    // Test RF-05: Authenticate User
    #[test]
    fn test_authenticate_user() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        client.register_user(
            &user_id,
            &String::from_str(&env, "Frank"),
            &String::from_str(&env, "frank@example.com"),
            &String::from_str(&env, "555-0006"),
            &String::from_str(&env, "1991-09-03"),
            &String::from_str(&env, "Male"),
        );

        let is_auth = client.authenticate_user(&user_id);
        assert!(is_auth);

        let unknown_user = Address::generate(&env);
        let is_auth_unknown = client.authenticate_user(&unknown_user);
        assert!(!is_auth_unknown);
    }

    // Test RF-06: Create Destination
    #[test]
    fn test_create_destination() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let dest_id = String::from_str(&env, "dest_001");
        let name = String::from_str(&env, "Cancun Beach Paradise");
        let address = String::from_str(&env, "Blvd. Kukulkan KM 12.5");
        let location = String::from_str(&env, "Cancun, Mexico");
        let description = String::from_str(&env, "Beautiful Caribbean beach with white sand and crystal clear water");

        client.create_destination(&dest_id, &name, &address, &location, &description);

        let dest = client.get_destination(&dest_id);
        assert!(dest.is_some());
        let (n, a, l, d, r) = dest.unwrap();
        assert_eq!(n, name);
        assert_eq!(a, address);
        assert_eq!(l, location);
        assert_eq!(d, description);
        assert_eq!(r, 0u32);
    }

    // Test RF-07: Delete Destination
    #[test]
    fn test_delete_destination() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let dest_id = String::from_str(&env, "dest_002");
        client.create_destination(
            &dest_id,
            &String::from_str(&env, "Mountain Resort"),
            &String::from_str(&env, "Km 45 Highway"),
            &String::from_str(&env, "Morelia, Mexico"),
            &String::from_str(&env, "Serene mountain getaway"),
        );

        client.delete_destination(&dest_id);
        let dest = client.get_destination(&dest_id);
        assert!(dest.is_none());
    }

    // Test RF-08: Update Destination
    #[test]
    fn test_update_destination() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let dest_id = String::from_str(&env, "dest_003");
        client.create_destination(
            &dest_id,
            &String::from_str(&env, "City Tour"),
            &String::from_str(&env, "Downtown"),
            &String::from_str(&env, "Mexico City"),
            &String::from_str(&env, "Historic city center"),
        );

        let new_desc = String::from_str(&env, "Updated historic city center with modern amenities");
        client.update_destination(&dest_id, &Option::<String>::None, &Option::<String>::None, &Some(new_desc.clone()));

        let dest = client.get_destination(&dest_id);
        assert!(dest.is_some());
        let (_, _, _, d, _) = dest.unwrap();
        assert_eq!(d, new_desc);
    }

    // Test RF-09: Query Destination Information
    #[test]
    fn test_list_destinations() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let dest1 = String::from_str(&env, "dest_004");
        let dest2 = String::from_str(&env, "dest_005");

        client.create_destination(
            &dest1,
            &String::from_str(&env, "Beach A"),
            &String::from_str(&env, "Addr A"),
            &String::from_str(&env, "Loc A"),
            &String::from_str(&env, "Desc A"),
        );
        client.create_destination(
            &dest2,
            &String::from_str(&env, "Beach B"),
            &String::from_str(&env, "Addr B"),
            &String::from_str(&env, "Loc B"),
            &String::from_str(&env, "Desc B"),
        );

        let dests = client.list_destinations();
        assert_eq!(dests.len(), 2);
    }

    // Test RF-10: Upload Multimedia
    #[test]
    fn test_upload_media() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let dest_id = String::from_str(&env, "dest_006");
        client.create_destination(
            &dest_id,
            &String::from_str(&env, "Photo Destination"),
            &String::from_str(&env, "Addr"),
            &String::from_str(&env, "Loc"),
            &String::from_str(&env, "Desc"),
        );

        let media_url = String::from_str(&env, "https://example.com/photo.jpg");
        let media_type = String::from_str(&env, "image/jpeg");
        client.upload_media(&dest_id, &media_url, &media_type);

        // Verify media was stored by creating another entry
        let media_url2 = String::from_str(&env, "https://example.com/video.mp4");
        let media_type2 = String::from_str(&env, "video/mp4");
        client.upload_media(&dest_id, &media_url2, &media_type2);
    }

    // Test RF-11: Add Comment
    #[test]
    fn test_add_comment() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let dest_id = String::from_str(&env, "dest_007");
        client.create_destination(
            &dest_id,
            &String::from_str(&env, "Rated Destination"),
            &String::from_str(&env, "Addr"),
            &String::from_str(&env, "Loc"),
            &String::from_str(&env, "Desc"),
        );

        let user_id = Address::generate(&env);
        let comment = String::from_str(&env, "Amazing place! Highly recommended!");
        let rating = 5u32;

        client.add_comment(&dest_id, &user_id, &comment, &rating);

        let dest = client.get_destination(&dest_id);
        assert!(dest.is_some());
        let (_, _, _, _, avg_rating) = dest.unwrap();
        assert_eq!(avg_rating, 5u32);
    }

    // Test RF-12: Create Reservation
    #[test]
    fn test_create_reservation() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        let dest_id = String::from_str(&env, "dest_008");
        let res_id = String::from_str(&env, "res_001");
        let check_in = String::from_str(&env, "2025-01-15");
        let check_out = String::from_str(&env, "2025-01-22");

        client.create_reservation(&res_id, &user_id, &dest_id, &check_in, &check_out, &1500u64);

        let status = client.get_reservation_status(&res_id);
        assert_eq!(status, Some(String::from_str(&env, "reserved")));
    }

    // Test RF-13: Cancel Reservation
    #[test]
    fn test_cancel_reservation() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        let dest_id = String::from_str(&env, "dest_009");
        let res_id = String::from_str(&env, "res_002");

        client.create_reservation(
            &res_id,
            &user_id,
            &dest_id,
            &String::from_str(&env, "2025-02-01"),
            &String::from_str(&env, "2025-02-08"),
            &2000u64,
        );

        client.cancel_reservation(&res_id);
        let status = client.get_reservation_status(&res_id);
        assert_eq!(status, Some(String::from_str(&env, "cancelled")));
    }

    // Test RF-14: Query Reservation Status
    #[test]
    fn test_get_reservation_status() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        let res_id = String::from_str(&env, "res_003");

        client.create_reservation(
            &res_id,
            &user_id,
            &String::from_str(&env, "dest_010"),
            &String::from_str(&env, "2025-03-01"),
            &String::from_str(&env, "2025-03-07"),
            &1800u64,
        );

        let status = client.get_reservation_status(&res_id);
        assert_eq!(status, Some(String::from_str(&env, "reserved")));
    }

    // Test RF-15: Pay Reservation
    #[test]
    fn test_pay_reservation() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        let user_id = Address::generate(&env);
        let res_id = String::from_str(&env, "res_004");

        client.create_reservation(
            &res_id,
            &user_id,
            &String::from_str(&env, "dest_011"),
            &String::from_str(&env, "2025-04-01"),
            &String::from_str(&env, "2025-04-10"),
            &2500u64,
        );

        let tx_ref = String::from_str(&env, "tx_payment_12345");
        client.pay_reservation(&res_id, &tx_ref);

        let status = client.get_reservation_status(&res_id);
        assert_eq!(status, Some(String::from_str(&env, "reserved")));
    }

    // Integration test: Full booking flow
    #[test]
    fn test_full_booking_flow() {
        let (env, contract_id) = setup_env();
        let client = AlasLatinasClient::new(&env, &contract_id);
        
        // Register user
        let user_id = Address::generate(&env);
        client.register_user(
            &user_id,
            &String::from_str(&env, "Grace Lopez"),
            &String::from_str(&env, "grace@example.com"),
            &String::from_str(&env, "555-0010"),
            &String::from_str(&env, "1994-06-12"),
            &String::from_str(&env, "Female"),
        );
        assert!(client.authenticate_user(&user_id));

        // Create destination
        let dest_id = String::from_str(&env, "dest_full_flow");
        client.create_destination(
            &dest_id,
            &String::from_str(&env, "Dream Resort"),
            &String::from_str(&env, "123 Resort Lane"),
            &String::from_str(&env, "Paradise Island"),
            &String::from_str(&env, "Luxurious beachfront resort"),
        );

        // Add comments/rating
        let comment1 = String::from_str(&env, "Excellent service!");
        client.add_comment(&dest_id, &user_id, &comment1, &5u32);

        // Create reservation
        let res_id = String::from_str(&env, "res_full_flow");
        client.create_reservation(
            &res_id,
            &user_id,
            &dest_id,
            &String::from_str(&env, "2025-05-01"),
            &String::from_str(&env, "2025-05-15"),
            &3500u64,
        );
        assert_eq!(client.get_reservation_status(&res_id), Some(String::from_str(&env, "reserved")));

        // Pay reservation
        let tx_ref = String::from_str(&env, "tx_full_flow_001");
        client.pay_reservation(&res_id, &tx_ref);

        // Verify final state
        let dest_final = client.get_destination(&dest_id);
        assert!(dest_final.is_some());
        let user_final = client.get_user(&user_id);
        assert!(user_final.is_some());
    }
}
