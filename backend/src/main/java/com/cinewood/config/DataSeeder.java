package com.cinewood.config;

import com.cinewood.entity.Genre;
import com.cinewood.entity.MediaItem;
import com.cinewood.entity.User;
import com.cinewood.entity.Profile;
import com.cinewood.repository.GenreRepository;
import com.cinewood.repository.MediaItemRepository;
import com.cinewood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final GenreRepository genreRepository;
    private final MediaItemRepository mediaItemRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Sample HLS streams (open-source test streams)
    private static final String STREAM_BIG_BUCK = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    private static final String STREAM_SINTEL = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8";
    private static final String STREAM_TEARS = "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
    private static final String STREAM_ELEPHANT = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    @Override
    @Transactional
    public void run(String... args) {
        if (genreRepository.count() > 0) {
            log.info("Database already seeded. Skipping.");
            return;
        }

        log.info("Seeding CineWood database...");

        // Create genres
        Map<String, Genre> genres = new HashMap<>();
        List<String> genreNames = List.of("Action", "Drama", "Thriller", "Romance", "Comedy",
                "Sci-Fi", "Horror", "Documentary", "Fantasy", "Crime", "Adventure", "Animation");
        for (String name : genreNames) {
            Genre g = genreRepository.save(Genre.builder().name(name).build());
            genres.put(name, g);
        }

        // Create admin user
        User admin = User.builder()
                .email("admin@cinewood.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role("ROLE_ADMIN")
                .subscriptionTier("ULTRA_4K")
                .build();
        Profile adminProfile = Profile.builder()
                .user(admin)
                .profileName("Admin")
                .avatarUrl("")
                .isKids(false)
                .build();
        admin.getProfiles().add(adminProfile);
        userRepository.save(admin);

        // Create demo user
        User demoUser = User.builder()
                .email("user@cinewood.com")
                .passwordHash(passwordEncoder.encode("user123"))
                .role("ROLE_USER")
                .subscriptionTier("HD")
                .build();
        Profile demoProfile = Profile.builder()
                .user(demoUser)
                .profileName("Demo User")
                .avatarUrl("")
                .isKids(false)
                .build();
        Profile kidsProfile = Profile.builder()
                .user(demoUser)
                .profileName("Kids")
                .avatarUrl("")
                .isKids(true)
                .build();
        demoUser.getProfiles().add(demoProfile);
        demoUser.getProfiles().add(kidsProfile);
        userRepository.save(demoUser);

        // ===================== TELUGU MOVIES =====================
        createMedia("Devara: Part 1", "A fierce tribal leader fights to protect his coastal community from smugglers and corrupt forces threatening their way of life.",
                "Telugu", 2024, "UA 16+", 165, "Jr. NTR, Janhvi Kapoor, Saif Ali Khan", "Koratala Siva",
                "https://image.tmdb.org/t/p/w500/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg",
                "https://image.tmdb.org/t/p/original/hAQnXxOwCjgYcKRgTdYPRC8neqL.jpg",
                STREAM_BIG_BUCK, true, true, "97% Match", 850000,
                Set.of(genres.get("Action"), genres.get("Drama"), genres.get("Thriller")));

        createMedia("RRR", "A fictional tale of two legendary revolutionaries and their journey far from home before they started fighting for their country.",
                "Telugu", 2022, "UA 13+", 187, "Ram Charan, Jr. NTR, Alia Bhatt", "S.S. Rajamouli",
                "https://image.tmdb.org/t/p/w500/u0XUBNQWlOvrh0Gd97ARGpIkL0.jpg",
                "https://image.tmdb.org/t/p/original/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg",
                STREAM_SINTEL, true, true, "98% Match", 1200000,
                Set.of(genres.get("Action"), genres.get("Drama"), genres.get("Adventure")));

        createMedia("Baahubali 2: The Conclusion", "When Shiva learns about his heritage, he begins to look for answers and his search leads him to the kingdom of Mahishmati.",
                "Telugu", 2017, "UA 13+", 167, "Prabhas, Rana Daggubati, Anushka Shetty", "S.S. Rajamouli",
                "https://image.tmdb.org/t/p/w500/u6RVP8ukgLaymeoi5VmX0JRAcCn.jpg",
                "https://image.tmdb.org/t/p/original/u6RVP8ukgLaymeoi5VmX0JRAcCn.jpg",
                STREAM_TEARS, true, true, "99% Match", 5000000,
                Set.of(genres.get("Action"), genres.get("Fantasy"), genres.get("Drama")));

        createMedia("Pushpa: The Rise", "A laborer rises through the ranks of a red sandalwood smuggling syndicate, facing off against law enforcement and rival factions.",
                "Telugu", 2021, "UA 16+", 179, "Allu Arjun, Rashmika Mandanna, Fahadh Faasil", "Sukumar",
                "https://image.tmdb.org/t/p/w500/jQIcn51nsvMrpB9NFwEOb9QHhFt.jpg",
                "https://image.tmdb.org/t/p/original/jQIcn51nsvMrpB9NFwEOb9QHhFt.jpg",
                STREAM_ELEPHANT, false, true, "96% Match", 900000,
                Set.of(genres.get("Action"), genres.get("Crime"), genres.get("Thriller")));

        createMedia("Eega", "After being murdered by a ruthless businessman, a man reincarnates as a housefly to exact his revenge.",
                "Telugu", 2012, "U/A", 132, "Nani, Samantha, Sudeep", "S.S. Rajamouli",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80",
                STREAM_BIG_BUCK, false, false, "92% Match", 450000,
                Set.of(genres.get("Fantasy"), genres.get("Comedy"), genres.get("Romance")));

        createMedia("Ala Vaikunthapurramuloo", "Bantu, raised in a middle-class family, discovers he was switched at birth with the son of a wealthy businessman.",
                "Telugu", 2020, "U/A", 163, "Allu Arjun, Pooja Hegde, Tabu", "Trivikram Srinivas",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
                STREAM_SINTEL, false, false, "94% Match", 680000,
                Set.of(genres.get("Action"), genres.get("Comedy"), genres.get("Drama")));

        // ===================== TAMIL MOVIES =====================
        createMedia("Ponniyin Selvan: I", "An epic historical drama set in the Chola dynasty, following the power struggle for the throne among royal siblings.",
                "Tamil", 2022, "UA 13+", 167, "Vikram, Aishwarya Rai, Jayam Ravi, Karthi", "Mani Ratnam",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80",
                STREAM_TEARS, true, true, "95% Match", 780000,
                Set.of(genres.get("Drama"), genres.get("Adventure"), genres.get("Action")));

        createMedia("Vikram", "A retired agent investigates a series of brutal murders that appear to be connected to a dark conspiracy within the police force.",
                "Tamil", 2022, "A", 174, "Kamal Haasan, Vijay Sethupathi, Fahadh Faasil", "Lokesh Kanagaraj",
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80",
                STREAM_BIG_BUCK, false, true, "96% Match", 720000,
                Set.of(genres.get("Action"), genres.get("Thriller"), genres.get("Crime")));

        createMedia("Master", "An alcoholic professor is transferred to a juvenile reform center where he locks horns with a ruthless gangster who uses children for his criminal activities.",
                "Tamil", 2021, "UA 16+", 179, "Vijay, Vijay Sethupathi, Malavika Mohanan", "Lokesh Kanagaraj",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
                STREAM_SINTEL, false, false, "89% Match", 550000,
                Set.of(genres.get("Action"), genres.get("Thriller")));

        createMedia("Jailer", "An honest retired jailer is forced back into action when his son, a police officer, is threatened by a dangerous criminal network.",
                "Tamil", 2023, "UA 16+", 168, "Rajinikanth, Mohanlal, Jackie Shroff", "Nelson",
                "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=80",
                STREAM_TEARS, true, true, "93% Match", 800000,
                Set.of(genres.get("Action"), genres.get("Comedy"), genres.get("Thriller")));

        // ===================== KANNADA MOVIES =====================
        createMedia("KGF: Chapter 2", "Rocky's meteoric rise continues as he fights to consolidate his power over the gold mines while facing threats from all directions.",
                "Kannada", 2022, "UA 16+", 168, "Yash, Sanjay Dutt, Raveena Tandon", "Prashanth Neel",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
                STREAM_BIG_BUCK, true, true, "97% Match", 1500000,
                Set.of(genres.get("Action"), genres.get("Drama"), genres.get("Crime")));

        createMedia("Kantara", "A young man from a remote village becomes embroiled in a conflict with forest officials protecting the local wildlife reserve, drawing on ancient spiritual traditions.",
                "Kannada", 2022, "UA 16+", 148, "Rishab Shetty, Sapthami Gowda", "Rishab Shetty",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80",
                STREAM_SINTEL, true, true, "98% Match", 1100000,
                Set.of(genres.get("Action"), genres.get("Drama"), genres.get("Thriller")));

        // ===================== HINDI MOVIES =====================
        createMedia("Jawan", "A jailer and his band of women inmates take on corrupt officials while uncovering a deeper conspiracy that connects to the protagonist's traumatic past.",
                "Hindi", 2023, "UA 13+", 169, "Shah Rukh Khan, Nayanthara, Vijay Sethupathi", "Atlee",
                "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
                "https://image.tmdb.org/t/p/original/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
                STREAM_TEARS, true, true, "95% Match", 1300000,
                Set.of(genres.get("Action"), genres.get("Thriller"), genres.get("Drama")));

        createMedia("Pathaan", "A mysterious agent resurfaces after years in exile to stop a ruthless mercenary from orchestrating a devastating attack on India.",
                "Hindi", 2023, "UA 13+", 146, "Shah Rukh Khan, Deepika Padukone, John Abraham", "Siddharth Anand",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
                STREAM_BIG_BUCK, false, true, "93% Match", 950000,
                Set.of(genres.get("Action"), genres.get("Thriller"), genres.get("Adventure")));

        createMedia("Animal", "The story of a son who has an intense, complex relationship with his father, leading him down a dark and violent path.",
                "Hindi", 2023, "A", 201, "Ranbir Kapoor, Anil Kapoor, Bobby Deol, Rashmika Mandanna", "Sandeep Reddy Vanga",
                "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1600&auto=format&fit=crop&q=80",
                STREAM_SINTEL, false, true, "88% Match", 700000,
                Set.of(genres.get("Action"), genres.get("Crime"), genres.get("Drama")));

        createMedia("3 Idiots", "Two friends embark on a quest to find a long-lost companion while revisiting memories from their time at engineering college.",
                "Hindi", 2009, "U/A", 170, "Aamir Khan, R. Madhavan, Sharman Joshi", "Rajkumar Hirani",
                "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80",
                STREAM_TEARS, false, false, "99% Match", 2500000,
                Set.of(genres.get("Comedy"), genres.get("Drama")));

        // ===================== ENGLISH MOVIES =====================
        createMedia("Inception", "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into a CEO's mind.",
                "English", 2010, "UA 13+", 148, "Leonardo DiCaprio, Tom Hardy, Joseph Gordon-Levitt", "Christopher Nolan",
                "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
                "https://image.tmdb.org/t/p/original/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
                STREAM_BIG_BUCK, true, false, "97% Match", 3000000,
                Set.of(genres.get("Sci-Fi"), genres.get("Action"), genres.get("Thriller")));

        createMedia("The Dark Knight", "Batman must accept one of the greatest psychological and physical tests to fight the chaos unleashed by an anarchist mastermind known as the Joker.",
                "English", 2008, "UA 13+", 152, "Christian Bale, Heath Ledger, Aaron Eckhart", "Christopher Nolan",
                "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nF4Cg.jpg",
                "https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
                STREAM_SINTEL, false, true, "99% Match", 3500000,
                Set.of(genres.get("Action"), genres.get("Crime"), genres.get("Drama")));

        createMedia("Interstellar", "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival on a dying Earth.",
                "English", 2014, "UA 13+", 169, "Matthew McConaughey, Anne Hathaway, Jessica Chastain", "Christopher Nolan",
                "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                STREAM_TEARS, false, false, "98% Match", 2800000,
                Set.of(genres.get("Sci-Fi"), genres.get("Adventure"), genres.get("Drama")));

        createMedia("Oppenheimer", "The story of the theoretical physicist who led the Manhattan Project, developing the first nuclear weapons during World War II.",
                "English", 2023, "A", 180, "Cillian Murphy, Emily Blunt, Robert Downey Jr.", "Christopher Nolan",
                "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                STREAM_BIG_BUCK, true, true, "96% Match", 1800000,
                Set.of(genres.get("Drama"), genres.get("Thriller")));

        // ===================== MALAYALAM MOVIES =====================
        createMedia("Drishyam 2", "Georgekutty's family deals with the aftermath of their crime as new evidence threatens to uncover the truth.",
                "Malayalam", 2021, "UA 13+", 152, "Mohanlal, Meena, Siddique", "Jeethu Joseph",
                "https://image.tmdb.org/t/p/w500/yIaWYQa2gb5JdPyazERnEj2oY6y.jpg",
                "https://image.tmdb.org/t/p/original/yIaWYQa2gb5JdPyazERnEj2oY6y.jpg",
                STREAM_SINTEL, false, true, "95% Match", 600000,
                Set.of(genres.get("Thriller"), genres.get("Crime"), genres.get("Drama")));

        createMedia("Manjummel Boys", "Based on a true story, a group of friends go on a trip to Kodaikanal where one of them gets trapped in a narrow cave, leading to a desperate rescue mission.",
                "Malayalam", 2024, "UA 13+", 136, "Soubin Shahir, Sreenath Bhasi, Balu Varghese", "Chidambaram",
                "https://image.tmdb.org/t/p/w500/xeXnLhBsHYkFMGbSXb1yEBpsmDJ.jpg",
                "https://image.tmdb.org/t/p/original/xeXnLhBsHYkFMGbSXb1yEBpsmDJ.jpg",
                STREAM_TEARS, true, true, "97% Match", 500000,
                Set.of(genres.get("Thriller"), genres.get("Adventure"), genres.get("Drama")));

        log.info("Database seeding completed! {} movies added.", mediaItemRepository.count());
    }

    private void createMedia(String title, String description, String language, int year, String ageRating,
                             int duration, String cast, String director, String thumbnail, String banner,
                             String stream, boolean featured, boolean trending, String match, int views,
                             Set<Genre> genreSet) {
        MediaItem item = MediaItem.builder()
                .title(title)
                .description(description)
                .language(language)
                .releaseYear(year)
                .ageRating(ageRating)
                .durationMinutes(duration)
                .cast(cast)
                .director(director)
                .thumbnailUrl(thumbnail)
                .bannerUrl(banner)
                .videoStreamUrl(stream)
                .isFeatured(featured)
                .isTrending(trending)
                .matchPercentage(match)
                .viewCount(views)
                .genres(genreSet)
                .build();
        mediaItemRepository.save(item);
    }
}
