using AttendanceSystem.Data;
using AttendanceSystem.Models;
using AttendanceSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AttendanceSystem.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;

        public EmployeeService(AppDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }


        public async Task<List<Employee>> GetAllAsync()
        {
            return await _context.Employees.ToListAsync();
        }

        public async Task<Employee> GetByIdAsync(string id) =>
            await _context.Employees.FindAsync(id);

        public async Task<Employee> CreateAsync(CreateEmployeeDto dto)
        {
            var employee = new Employee
            {
                EmployeeID = dto.EmployeeID,
                FullName = dto.FullName,
                Department = dto.Department,
                Position = dto.Position,
                Phone = dto.Phone,
                Email = dto.Email,

                Status = true,
                CreatedAt = DateTime.Now,
                CreatedBy = "system"
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return employee;
        }

        public async Task<Employee?> UpdateAsync(string id, CreateEmployeeDto dto)
        {
            var existing = await _context.Employees.FindAsync(id);
            if (existing == null) return null;

            existing.EmployeeID = dto.EmployeeID;
            existing.FullName = dto.FullName;
            existing.Department = dto.Department;
            existing.Position = dto.Position;
            existing.Phone = dto.Phone;
            existing.Email = dto.Email;

            existing.UpdatedAt = DateTime.Now;
            existing.UpdatedBy = "system";

            await _context.SaveChangesAsync();

            return existing;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return false;

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string?> UploadAvatarAsync(string id, IFormFile file)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return null;

            // Thư mục gốc: images/employees/{EmployeeID}/avatar
            var rootDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "images", "employees", employee.EmployeeID, "avatar");
            if (!Directory.Exists(rootDir))
                Directory.CreateDirectory(rootDir);

            // Xóa toàn bộ ảnh cũ trong thư mục avatar
            var existingFiles = Directory.GetFiles(rootDir);
            foreach (var oldFile in existingFiles)
            {
                System.IO.File.Delete(oldFile);
            }

            // Đặt tên file mặc định là "avatar" + phần mở rộng gốc
            var extension = Path.GetExtension(file.FileName);
            var fileName = "avatar" + extension;
            var filePath = Path.Combine(rootDir, fileName);

            // Lưu file mới
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Lưu đường dẫn tương đối vào DB
            var avatarPath = Path.Combine("..", "..", "images", "employees", employee.EmployeeID, "avatar", fileName);
            employee.AvatarPath = avatarPath;
            employee.UpdatedAt = DateTime.Now;
            employee.UpdatedBy = "system";
            await _context.SaveChangesAsync();

            return avatarPath;
        }

        public async Task<bool> UploadPhotosAsync(string id, List<IFormFile> files)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return false;

            // Thư mục gốc: images/employees/{EmployeeID}/photos
            var rootDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "images", "employees", employee.EmployeeID, "photos");
            if (!Directory.Exists(rootDir))
                Directory.CreateDirectory(rootDir);

            // Xóa toàn bộ ảnh cũ trong thư mục photos của nhân viên
            var existingFiles = Directory.GetFiles(rootDir);
            foreach (var oldFile in existingFiles)
            {
                System.IO.File.Delete(oldFile);
            }

            // Lưu tất cả ảnh mới với tên đánh số từ 1 trở đi
            int counter = 1;
            foreach (var file in files)
            {
                // Lấy phần mở rộng gốc của file (jpg, png, ...)
                var extension = Path.GetExtension(file.FileName);

                // Đặt tên mới: 1.jpg, 2.png, ...
                var fileName = counter.ToString() + extension;
                var filePath = Path.Combine(rootDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                counter++;
            }

            // Sau khi lưu ảnh, gọi sang FastAPI để tính embedding
            var response = await _httpClient.GetAsync($"/embed?employee_id={employee.EmployeeID}");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var embeddingsResult = JsonSerializer.Deserialize<JsonElement>(content);

                // embeddingsResult["embeddings"][employee.EmployeeID] là mảng float
                var embeddingArray = embeddingsResult.GetProperty("embeddings")
                                                     .GetProperty(employee.EmployeeID)
                                                     .EnumerateArray()
                                                     .Select(x => (float)x.GetDouble())
                                                     .ToArray();

                // Chuyển float[] sang byte[] để lưu DB
                var bytes = new byte[embeddingArray.Length * sizeof(float)];
                Buffer.BlockCopy(embeddingArray, 0, bytes, 0, bytes.Length);

                // Tạo bản ghi FaceEmbedding
                var faceEmbedding = new FaceEmbedding
                {
                    EmployeeID = employee.EmployeeID,
                    Embedding = bytes,
                    ImagePath = string.Join(";", rootDir), // chỉ lưu thư mục
                    Version = 1,
                    CreatedAt = DateTime.Now,
                    CreatedBy = "system"
                };

                _context.FaceEmbeddings.Add(faceEmbedding);
                await _context.SaveChangesAsync();
            }

            return true;
        }

    }
}
