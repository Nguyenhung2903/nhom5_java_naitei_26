package com.nhom_5.server.config;

import com.nhom_5.server.entity.Genre;
import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.entity.News;
import com.nhom_5.server.entity.Promotion;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.DiscountType;
import com.nhom_5.server.entity.enums.MovieStatus;
import com.nhom_5.server.entity.enums.PromotionStatus;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.repository.GenreRepository;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.repository.NewsRepository;
import com.nhom_5.server.repository.PromotionRepository;
import com.nhom_5.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final NewsRepository newsRepository;
    private final PromotionRepository promotionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.init-admin.enabled:true}")
    private boolean initAdminEnabled;

    @Value("${app.init-admin.username:admin}")
    private String adminUsername;

    @Value("${app.init-admin.password:Admin@123456}")
    private String adminPassword;

    @Value("${app.init-admin.email:admin@cinemanest.vn}")
    private String adminEmail;

    @Value("${app.init-admin.full-name:System Administrator}")
    private String adminFullName;

    @Override
    @Transactional
    public void run(String... args) {
        if (!initAdminEnabled) {
            log.info("DataInitializer: Auto-initialization is disabled.");
            return;
        }

        initializeAdminUser();
        initializeTestUser();
        initializeCatalogData();
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByUsername(adminUsername) && !userRepository.existsByRole(Role.ADMIN)) {
            log.info("DataInitializer: Initializing default ADMIN account [{}]...", adminUsername);
            User admin = User.builder()
                    .username(adminUsername.trim().toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail.trim().toLowerCase())
                    .fullName(adminFullName)
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .phone("0900000001")
                    .build();

            userRepository.save(admin);
            log.info("DataInitializer: Default ADMIN account created successfully! (Username: {}, Password: {})", adminUsername, adminPassword);
        } else {
            log.info("DataInitializer: ADMIN account already exists, skipping initialization.");
        }
    }

    private void initializeTestUser() {
        String testUsername = "user";
        if (!userRepository.existsByUsername(testUsername)) {
            log.info("DataInitializer: Initializing default test USER account [{}]...", testUsername);
            User testUser = User.builder()
                    .username(testUsername)
                    .password(passwordEncoder.encode("User@123456"))
                    .email("user@cinemanest.vn")
                    .fullName("Standard Test User")
                    .role(Role.USER)
                    .status(UserStatus.ACTIVE)
                    .phone("0900000002")
                    .build();

            userRepository.save(testUser);
            log.info("DataInitializer: Default test USER account created successfully! (Username: user, Password: User@123456)");
        }
    }

    private void initializeCatalogData() {
        List<Genre> genres = initializeGenres();
        initializeMovies(genres);
        initializeNews();
        initializePromotions();
    }

    private List<Genre> initializeGenres() {
        List<String> genreNames = List.of(
                "Hành động",
                "Phiêu lưu",
                "Hoạt hình",
                "Hài",
                "Tâm lý",
                "Kinh dị",
                "Khoa học viễn tưởng",
                "Lãng mạn",
                "Gia đình",
                "Tội phạm"
        );

        return genreNames.stream()
                .map(name -> genreRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> genreRepository.save(Genre.builder().name(name).build())))
                .toList();
    }

    private void initializeMovies(List<Genre> genres) {
        List<MovieSeed> movies = List.of(
                new MovieSeed("Đêm Thành Phố Không Ngủ", "Một đặc vụ trẻ lần theo đường dây buôn dữ liệu trong thành phố rực sáng về đêm.", 118, "Nguyễn Minh Khôi", "Trần Bảo Sơn, Lan Phương", "Tiếng Việt", "16+", LocalDate.now().minusDays(28), "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", MovieStatus.NOW_SHOWING, 0, 9),
                new MovieSeed("Hành Trình Qua Mùa Hạ", "Nhóm bạn thân trở về quê cũ và tìm lại lời hứa đã bỏ quên sau mười năm.", 104, "Phạm An Nhiên", "Hoàng Hà, Quốc Anh", "Tiếng Việt", "13+", LocalDate.now().minusDays(14), "https://images.unsplash.com/photo-1485846234645-a62644f84728", null, MovieStatus.NOW_SHOWING, 1, 4),
                new MovieSeed("Robot Và Cánh Đồng Sao", "Một robot giao hàng vô tình trở thành người bạn của cô bé yêu thiên văn.", 96, "Lê Nhật Nam", "Thanh Trúc, Bé An", "Tiếng Việt", "P", LocalDate.now().plusDays(10), "https://images.unsplash.com/photo-1535223289827-42f1e9919769", null, MovieStatus.COMING_SOON, 2, 8),
                new MovieSeed("Căn Hộ Tầng 13", "Một nhà báo điều tra chuỗi mất tích bí ẩn trong khu chung cư cũ.", 110, "Vũ Hải Đăng", "Diễm My, Kiều Minh Tuấn", "Tiếng Việt", "18+", LocalDate.now().minusDays(7), "https://images.unsplash.com/photo-1509248961158-e54f6934749c", null, MovieStatus.NOW_SHOWING, 5, 9),
                new MovieSeed("Bản Tình Ca Ở Hội An", "Hai nghệ sĩ trẻ gặp nhau trong lễ hội đèn lồng và cùng viết lại giấc mơ âm nhạc.", 102, "Mai Linh Chi", "Jun Phạm, Khả Ngân", "Tiếng Việt", "13+", LocalDate.now().plusDays(20), "https://images.unsplash.com/photo-1528127269322-539801943592", null, MovieStatus.COMING_SOON, 7, 4),
                new MovieSeed("Siêu Đầu Bếp Bất Đắc Dĩ", "Một nhân viên văn phòng phải cứu nhà hàng gia đình bằng cuộc thi ẩm thực toàn quốc.", 98, "Trần Đức Huy", "Hứa Vĩ Văn, Puka", "Tiếng Việt", "P", LocalDate.now().minusDays(35), "https://images.unsplash.com/photo-1513104890138-7c749659a591", null, MovieStatus.NOW_SHOWING, 3, 8),
                new MovieSeed("Biệt Đội Sao Băng", "Các phi hành gia trẻ chạy đua ngăn một trạm vũ trụ rơi xuống Trái Đất.", 126, "Đặng Gia Bảo", "Liên Bỉnh Phát, Mlee", "Tiếng Việt", "13+", LocalDate.now().plusDays(32), "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa", null, MovieStatus.COMING_SOON, 0, 6),
                new MovieSeed("Một Ngày Làm Cha", "Một chàng trai độc thân bất ngờ chăm sóc đứa cháu nhỏ và học cách trưởng thành.", 101, "Ngô Thanh Bình", "Trấn Thành, Uyển Ân", "Tiếng Việt", "P", LocalDate.now().minusDays(45), "https://images.unsplash.com/photo-1511895426328-dc8714191300", null, MovieStatus.ENDED, 3, 4),
                new MovieSeed("Hồ Sơ Lặng Im", "Nữ kiểm sát viên đối mặt vụ án cũ khiến cả thị trấn che giấu sự thật.", 115, "Phan Nhật Quang", "Ninh Dương Lan Ngọc, Mạnh Trường", "Tiếng Việt", "16+", LocalDate.now().minusDays(4), "https://images.unsplash.com/photo-1505664194779-8beaceb93744", null, MovieStatus.NOW_SHOWING, 4, 9),
                new MovieSeed("Vương Quốc Cầu Vồng", "Công chúa nhỏ và chú rồng giấy bảo vệ xứ sở màu sắc khỏi màn sương xám.", 88, "Bùi Hoàng Yến", "Lồng tiếng Việt", "Tiếng Việt", "P", LocalDate.now().plusDays(15), "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9", null, MovieStatus.COMING_SOON, 2, 8),
                new MovieSeed("Đường Đua Cuối Cùng", "Tay đua kỳ cựu quay lại đường đua để cứu đội xe đang bên bờ giải thể.", 112, "Cao Đức Thắng", "Song Luân, Jun Vũ", "Tiếng Việt", "13+", LocalDate.now().minusDays(60), "https://images.unsplash.com/photo-1503376780353-7e6692767b70", null, MovieStatus.ENDED, 0, 1),
                new MovieSeed("Bức Thư Từ Biển", "Một cô gái tìm cha qua những bức thư cũ được gửi từ ngọn hải đăng miền Trung.", 107, "Đỗ Hà My", "Kaity Nguyễn, Avin Lu", "Tiếng Việt", "13+", LocalDate.now().minusDays(21), "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", null, MovieStatus.NOW_SHOWING, 4, 7)
        );

        movies.stream()
                .filter(seed -> !movieRepository.existsByTitleIgnoreCase(seed.title()))
                .map(seed -> Movie.builder()
                        .title(seed.title())
                        .description(seed.description())
                        .duration(seed.duration())
                        .director(seed.director())
                        .castMembers(seed.castMembers())
                        .language(seed.language())
                        .ageRating(seed.ageRating())
                        .releaseDate(seed.releaseDate())
                        .poster(seed.poster())
                        .trailer(seed.trailer())
                        .status(seed.status())
                        .genres(Set.of(genres.get(seed.firstGenreIndex()), genres.get(seed.secondGenreIndex())))
                        .build())
                .forEach(movieRepository::save);
    }

    private void initializeNews() {
        List<NewsSeed> news = List.of(
                new NewsSeed("CinemaNest mở bán vé tuần phim Việt", "Tuần phim Việt giới thiệu nhiều tác phẩm mới thuộc các thể loại hành động, gia đình và lãng mạn. Khán giả có thể đặt vé sớm trên hệ thống để chọn chỗ đẹp.", "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"),
                new NewsSeed("Cập nhật lịch chiếu cuối tuần", "Các suất chiếu cuối tuần đã được bổ sung tại những khung giờ cao điểm. Người dùng nên kiểm tra lại lịch trước khi đến rạp để có trải nghiệm thuận tiện.", "https://images.unsplash.com/photo-1478720568477-152d9b164e26"),
                new NewsSeed("Ra mắt phòng chiếu tiêu chuẩn mới", "Hệ thống phòng chiếu được nâng cấp âm thanh, màn chiếu và ghế ngồi nhằm mang đến trải nghiệm xem phim ổn định hơn cho mọi khách hàng.", "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c"),
                new NewsSeed("Hướng dẫn đặt vé trực tuyến an toàn", "CinemaNest khuyến nghị khách hàng đăng nhập đúng tài khoản, kiểm tra thông tin suất chiếu và lưu lại mã đặt vé sau khi thanh toán.", "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"),
                new NewsSeed("Top phim gia đình đáng xem tháng này", "Danh sách phim gia đình tháng này phù hợp cho phụ huynh và trẻ nhỏ, với nội dung nhẹ nhàng, hình ảnh tươi sáng và thông điệp tích cực.", "https://images.unsplash.com/photo-1511895426328-dc8714191300"),
                new NewsSeed("Ưu đãi dành cho học sinh sinh viên", "Khách hàng học sinh sinh viên có thể theo dõi mục khuyến mãi để nhận các mã giảm giá áp dụng trong tuần.", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"),
                new NewsSeed("Bảo trì hệ thống thanh toán ban đêm", "Một số phương thức thanh toán có thể gián đoạn trong khung giờ bảo trì. Các giao dịch đã hoàn tất vẫn được lưu lại trong lịch sử đặt vé.", "https://images.unsplash.com/photo-1551288049-bebda4e38f71"),
                new NewsSeed("Lưu ý khi xem phim phân loại 16+", "Khách hàng cần mang giấy tờ phù hợp khi xem các phim có phân loại độ tuổi. Nhân viên rạp có thể kiểm tra thông tin trước khi vào phòng chiếu.", "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4"),
                new NewsSeed("CinemaNest thử nghiệm vé điện tử", "Vé điện tử giúp khách hàng vào rạp nhanh hơn bằng mã QR. Tính năng này đang được thử nghiệm ở một số cụm rạp trước khi mở rộng.", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"),
                new NewsSeed("Những phim sắp chiếu được mong đợi", "Nhiều tựa phim mới sẽ ra mắt trong tháng tới, bao gồm hoạt hình, khoa học viễn tưởng và tâm lý xã hội.", "https://images.unsplash.com/photo-1485846234645-a62644f84728"),
                new NewsSeed("Quy định đổi trả vé tại quầy", "Khách hàng cần liên hệ nhân viên trước giờ chiếu theo quy định của rạp. Vé đã qua giờ chiếu không hỗ trợ đổi trả.", "https://images.unsplash.com/photo-1565372919611-4b7c86de5ebf"),
                new NewsSeed("Khuyến nghị trải nghiệm rạp vào giờ cao điểm", "Khách hàng nên đến sớm trước giờ chiếu từ 15 đến 20 phút để nhận combo, kiểm tra vé và ổn định chỗ ngồi.", "https://images.unsplash.com/photo-1536440136628-849c177e76a1")
        );

        news.stream()
                .filter(seed -> !newsRepository.existsByTitleIgnoreCase(seed.title()))
                .map(seed -> News.builder()
                        .title(seed.title())
                        .content(seed.content())
                        .thumbnail(seed.thumbnail())
                        .build())
                .forEach(newsRepository::save);
    }

    private void initializePromotions() {
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        List<PromotionSeed> promotions = List.of(
                new PromotionSeed("Ưu đãi thành viên mới", "Giảm 20% cho lần đặt vé đầu tiên trên CinemaNest.", DiscountType.PERCENT, "20", now.minus(2, ChronoUnit.DAYS), now.plus(20, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "NEWBIE20"),
                new PromotionSeed("Combo cuối tuần", "Giảm cố định khi mua vé kèm combo bắp nước vào thứ bảy và chủ nhật.", DiscountType.FIXED, "30000", now.minus(1, ChronoUnit.DAYS), now.plus(14, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "WEEKEND30K"),
                new PromotionSeed("Đặt sớm giá tốt", "Ưu đãi cho khách hàng đặt vé trước ngày chiếu ít nhất ba ngày.", DiscountType.PERCENT, "15", now, now.plus(30, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "EARLY15"),
                new PromotionSeed("Mùa phim Việt", "Giảm giá cho các suất chiếu phim Việt trong tháng.", DiscountType.PERCENT, "10", now.minus(5, ChronoUnit.DAYS), now.plus(25, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "VIETFILM10"),
                new PromotionSeed("Suất chiếu sáng", "Giảm cố định cho các suất chiếu trước 11 giờ.", DiscountType.FIXED, "20000", now.minus(3, ChronoUnit.DAYS), now.plus(45, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "MORNING20K"),
                new PromotionSeed("Ngày hội học sinh sinh viên", "Ưu đãi dành cho khách hàng học sinh sinh viên trong khung giờ thấp điểm.", DiscountType.PERCENT, "25", now.minus(7, ChronoUnit.DAYS), now.plus(7, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "STUDENT25"),
                new PromotionSeed("Cặp đôi xem phim", "Giảm 50.000đ cho đơn hàng từ hai vé trở lên.", DiscountType.FIXED, "50000", now.minus(10, ChronoUnit.DAYS), now.plus(10, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "COUPLE50K"),
                new PromotionSeed("Tri ân khách hàng thân thiết", "Mã ưu đãi riêng cho khách hàng có nhiều lượt đặt vé trong tháng.", DiscountType.PERCENT, "18", now.minus(15, ChronoUnit.DAYS), now.plus(15, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "LOYAL18"),
                new PromotionSeed("Ưu đãi sinh nhật CinemaNest", "Chương trình sinh nhật hệ thống với số lượng mã có hạn.", DiscountType.PERCENT, "30", now.plus(5, ChronoUnit.DAYS), now.plus(35, ChronoUnit.DAYS), PromotionStatus.INACTIVE, "BIRTHDAY30"),
                new PromotionSeed("Phim hoạt hình gia đình", "Giảm 12% cho nhóm phim hoạt hình và gia đình.", DiscountType.PERCENT, "12", now.minus(2, ChronoUnit.DAYS), now.plus(28, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "FAMILY12"),
                new PromotionSeed("Thanh toán online", "Giảm cố định cho đơn hàng thanh toán trực tuyến.", DiscountType.FIXED, "25000", now.minus(1, ChronoUnit.DAYS), now.plus(18, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "ONLINE25K"),
                new PromotionSeed("Đêm phim kinh dị", "Ưu đãi cho các suất chiếu phim kinh dị sau 21 giờ.", DiscountType.PERCENT, "13", now.minus(4, ChronoUnit.DAYS), now.plus(24, ChronoUnit.DAYS), PromotionStatus.ACTIVE, "HORROR13")
        );

        promotions.stream()
                .filter(seed -> !promotionRepository.existsByCodeIgnoreCase(seed.code()))
                .map(seed -> Promotion.builder()
                        .title(seed.title())
                        .description(seed.description())
                        .discountType(seed.discountType())
                        .discountValue(new BigDecimal(seed.discountValue()))
                        .startDate(seed.startDate())
                        .endDate(seed.endDate())
                        .status(seed.status())
                        .code(seed.code())
                        .build())
                .forEach(promotionRepository::save);
    }

    private record MovieSeed(
            String title,
            String description,
            int duration,
            String director,
            String castMembers,
            String language,
            String ageRating,
            LocalDate releaseDate,
            String poster,
            String trailer,
            MovieStatus status,
            int firstGenreIndex,
            int secondGenreIndex
    ) {
    }

    private record NewsSeed(String title, String content, String thumbnail) {
    }

    private record PromotionSeed(
            String title,
            String description,
            DiscountType discountType,
            String discountValue,
            Instant startDate,
            Instant endDate,
            PromotionStatus status,
            String code
    ) {
    }
}
