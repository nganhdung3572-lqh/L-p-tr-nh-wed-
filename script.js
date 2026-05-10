// Data storage
let stories = [];
let currentFilter = 'all';
let currentSearchTerm = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadStoriesFromLocalStorage();
    renderStories();
    addSampleStories();
});

// Add sample stories for demo
function addSampleStories() {
    if (stories.length === 0) {
        const sampleStories = [
            {
                id: Date.now() + 1,
                title: 'Chuyến du lịch Bali lần đầu',
                author: 'Nguyễn Văn A',
                category: 'du lịch',
                content: 'Tôi vừa trở về từ Bali - một hòn đảo tuyệt đẹp với những bãi biển cát trắng và nước biển trong xanh. Chuyến du lịch này đã thay đổi cách tôi nhìn nhận về cuộc sống. Mỗi ngày tôi đều dậy sớm để ngắm bình minh trên biển, tham quan các đền chùa cổ xưa, và giao lưu với những người dân địa phương thân thiện...',
                date: new Date('2026-05-08').toISOString(),
                likes: 45,
                liked: false
            },
            {
                id: Date.now() + 2,
                title: 'Cách tôi vượt qua khủng hoảng sự nghiệp',
                author: 'Trần Thị B',
                category: 'sự nghiệp',
                content: 'Năm ngoái, tôi bị mất việc vào lúc không ngờ. Đó là thời kỳ tối tăm nhất của tôi, nhưng nó cũng là khởi đầu của một hành trình mới. Tôi đã dành thời gian để học hỏi, phát triển kỹ năng, và tìm kiếm những cơ hội mới. Hôm nay, tôi đã tìm được công việc mơ ước mình...',
                date: new Date('2026-05-07').toISOString(),
                likes: 32,
                liked: false
            },
            {
                id: Date.now() + 3,
                title: 'Tình yêu bất ngờ từ một lời nhắn',
                author: 'Lê Minh C',
                category: 'tình yêu',
                content: 'Tôi không bao giờ nghĩ rằng tình yêu có thể bắt đầu từ một lời nhắn không chính thức trên mạng xã hội. Nhưng đó chính xác là cách tôi gặp người bạn sinh ra để dành cho tôi. Từ những cuộc trò chuyện dài vào đêm khuya đến những buổi hẹn hò tuyệt vời, tất cả đều như một giấc mơ...',
                date: new Date('2026-05-05').toISOString(),
                likes: 67,
                liked: false
            }
        ];

        stories = sampleStories;
        saveStoriesToLocalStorage();
        renderStories();
    }
}

// Modal Functions
function openAddStoryModal() {
    document.getElementById('addStoryModal').classList.add('active');
}

function closeAddStoryModal() {
    document.getElementById('addStoryModal').classList.remove('active');
    document.getElementById('storyForm').reset();
}

function closeStoryDetailModal() {
    document.getElementById('storyDetailModal').classList.remove('active');
}

// Add Story
function addStory(event) {
    event.preventDefault();

    const newStory = {
        id: Date.now(),
        title: document.getElementById('storyTitle').value,
        author: document.getElementById('storyAuthor').value,
        category: document.getElementById('storyCategory').value,
        content: document.getElementById('storyContent').value,
        date: new Date().toISOString(),
        likes: 0,
        liked: false
    };

    stories.unshift(newStory);
    saveStoriesToLocalStorage();
    renderStories();
    closeAddStoryModal();

    // Show success message
    showNotification('Câu chuyện của bạn đã được chia sẻ thành công!', 'success');
}

// Render Stories
function renderStories() {
    const storiesGrid = document.getElementById('storiesGrid');
    const emptyState = document.getElementById('emptyState');
    const filteredStories = getFilteredStories();

    storiesGrid.innerHTML = '';

    if (filteredStories.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredStories.forEach(story => {
        const storyCard = createStoryCard(story);
        storiesGrid.appendChild(storyCard);
    });
}

// Create Story Card
function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    
    const categoryEmoji = getCategoryEmoji(story.category);
    const excerpt = story.content.substring(0, 150) + '...';
    const formattedDate = formatDate(story.date);

    card.innerHTML = `
        <div class="story-card-header">
            <span class="story-category">${categoryEmoji} ${story.category}</span>
            <h3 class="story-title">${escapeHtml(story.title)}</h3>
            <p class="story-author">👤 ${escapeHtml(story.author)}</p>
        </div>
        <div class="story-content">${escapeHtml(excerpt)}</div>
        <div class="story-footer">
            <span class="story-date">${formattedDate}</span>
            <div class="story-actions">
                <button class="btn-icon" onclick="toggleLike(${story.id})" title="Thích">
                    ${story.liked ? '❤️' : '🤍'}
                    <span class="like-count">${story.likes}</span>
                </button>
                <button class="btn-icon" onclick="openStoryDetail(${story.id})" title="Đọc tiếp">📖</button>
                <button class="btn-icon" onclick="deleteStory(${story.id})" title="Xóa">🗑️</button>
            </div>
        </div>
    `;

    card.onclick = (e) => {
        if (!e.target.closest('.story-actions')) {
            openStoryDetail(story.id);
        }
    };

    return card;
}

// Open Story Detail
function openStoryDetail(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const detailContent = document.getElementById('storyDetailContent');
    const categoryEmoji = getCategoryEmoji(story.category);
    const formattedDate = formatDate(story.date);

    detailContent.innerHTML = `
        <div class="story-detail-header">
            <h1 class="story-detail-title">${escapeHtml(story.title)}</h1>
            <div class="story-detail-meta">
                <span>👤 ${escapeHtml(story.author)}</span>
                <span>${categoryEmoji} ${story.category}</span>
                <span>📅 ${formattedDate}</span>
            </div>
        </div>
        <div class="story-detail-content">${escapeHtml(story.content)}</div>
        <div class="story-detail-actions">
            <button class="btn-icon" onclick="toggleLike(${story.id})" title="Thích">
                ${story.liked ? '❤️' : '🤍'} <span class="like-count">${story.likes}</span>
            </button>
            <button class="btn-icon" onclick="shareStory(${story.id})" title="Chia sẻ">📤</button>
            <button class="btn-icon" onclick="deleteStory(${story.id})" title="Xóa">🗑️</button>
        </div>
    `;

    document.getElementById('storyDetailModal').classList.add('active');
}

// Filter Stories
function filterByCategory(category) {
    currentFilter = category;
    currentSearchTerm = '';
    document.getElementById('searchInput').value = '';
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderStories();
}

function filterStories() {
    currentSearchTerm = document.getElementById('searchInput').value.toLowerCase();
    currentFilter = 'all';
    
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.filter-btn')[0].classList.add('active');

    renderStories();
}

function getFilteredStories() {
    let filtered = stories;

    // Filter by category
    if (currentFilter !== 'all') {
        filtered = filtered.filter(story => story.category === currentFilter);
    }

    // Filter by search term
    if (currentSearchTerm) {
        filtered = filtered.filter(story => 
            story.title.toLowerCase().includes(currentSearchTerm) ||
            story.content.toLowerCase().includes(currentSearchTerm) ||
            story.author.toLowerCase().includes(currentSearchTerm)
        );
    }

    return filtered;
}

// Like Toggle
function toggleLike(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (story) {
        story.liked = !story.liked;
        story.likes += story.liked ? 1 : -1;
        saveStoriesToLocalStorage();
        renderStories();
        
        // Update detail modal if open
        if (document.getElementById('storyDetailModal').classList.contains('active')) {
            openStoryDetail(storyId);
        }
    }
}

// Delete Story
function deleteStory(storyId) {
    if (confirm('Bạn có chắc chắn muốn xóa câu chuyện này?')) {
        stories = stories.filter(s => s.id !== storyId);
        saveStoriesToLocalStorage();
        renderStories();
        closeStoryDetailModal();
        showNotification('Câu chuyện đã được xóa!', 'warning');
    }
}

// Share Story
function shareStory(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const text = `"${story.title}" - ${story.author}\n\n${story.content.substring(0, 100)}...\n\nĐọc tiếp trên Chia Sẻ Câu Chuyện 📖`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Câu chuyện đã được sao chép!', 'success');
    });
}

// Utility Functions
function getCategoryEmoji(category) {
    const emojis = {
        'tình yêu': '💕',
        'gia đình': '👨‍👩‍👧‍👦',
        'sự nghiệp': '💼',
        'du lịch': '✈️',
        'khác': '🌟'
    };
    return emojis[category] || '📖';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hôm nay lúc ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua lúc ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // You can enhance this with a proper notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Simple alert for now
    alert(message);
}

// Local Storage Functions
function saveStoriesToLocalStorage() {
    localStorage.setItem('storyShareData', JSON.stringify(stories));
}

function loadStoriesFromLocalStorage() {
    const stored = localStorage.getItem('storyShareData');
    if (stored) {
        stories = JSON.parse(stored);
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const addStoryModal = document.getElementById('addStoryModal');
    const storyDetailModal = document.getElementById('storyDetailModal');
    
    if (event.target == addStoryModal) {
        closeAddStoryModal();
    }
    if (event.target == storyDetailModal) {
        closeStoryDetailModal();
    }
}
