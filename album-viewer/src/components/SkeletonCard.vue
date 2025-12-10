<template>
  <div class="skeleton-card">
    <div class="skeleton-image skeleton-animate"></div>
    <div class="skeleton-content">
      <div class="skeleton-title skeleton-animate"></div>
      <div class="skeleton-artist skeleton-animate"></div>
      <div class="skeleton-price skeleton-animate"></div>
      <div class="skeleton-actions">
        <div class="skeleton-btn skeleton-animate"></div>
        <div class="skeleton-btn skeleton-animate"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.skeleton-image {
  width: 100%;
  height: 280px;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.05) 25%, 
    rgba(255,255,255,0.15) 50%, 
    rgba(255,255,255,0.05) 75%
  );
  background-size: 200% 100%;
}

.skeleton-content {
  padding: 1.75rem;
}

.skeleton-title {
  height: 24px;
  width: 80%;
  border-radius: 8px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.05) 25%, 
    rgba(255,255,255,0.15) 50%, 
    rgba(255,255,255,0.05) 75%
  );
  background-size: 200% 100%;
}

.skeleton-artist {
  height: 18px;
  width: 60%;
  border-radius: 6px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.05) 25%, 
    rgba(255,255,255,0.15) 50%, 
    rgba(255,255,255,0.05) 75%
  );
  background-size: 200% 100%;
}

.skeleton-price {
  height: 28px;
  width: 40%;
  border-radius: 8px;
  margin-bottom: 20px;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.05) 25%, 
    rgba(255,255,255,0.15) 50%, 
    rgba(255,255,255,0.05) 75%
  );
  background-size: 200% 100%;
}

.skeleton-actions {
  display: flex;
  gap: 12px;
}

.skeleton-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.05) 25%, 
    rgba(255,255,255,0.15) 50%, 
    rgba(255,255,255,0.05) 75%
  );
  background-size: 200% 100%;
}

.skeleton-animate {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
