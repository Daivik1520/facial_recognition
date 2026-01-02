from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Environment
    env: str = "development"

    # Paths
    model_cache_dir: Path = Path("./data/models")
    log_file: Path = Path("./logs/app.log")

    # CUDA
    cuda_visible_devices: str = "0"

    # Detection Settings
    detection_model: str = "antelopev2"
    det_size_width: int = 480
    det_size_height: int = 480
    det_thresh: float = 0.5

    # Recognition Settings
    recognition_model: str = "antelopev2"
    similarity_threshold: float = 0.72
    batch_size: int = 8
    max_face_size: int = 640

    # Quality Filter Settings
    min_face_size: int = 60
    
    @property
    def det_size(self) -> tuple[int, int]:
        """Return detection size as tuple for compatibility."""
        return (self.det_size_width, self.det_size_height)
    blur_threshold: float = 100.0
    max_yaw: float = 45.0
    max_pitch: float = 30.0
    min_brightness: int = 40
    max_brightness: int = 220

    # Database
    database_url: str = "postgresql://surveillance:changeme_secure_password@localhost:5432/surveillance_db"
    
    # RabbitMQ
    rabbitmq_url: str = "amqp://surveillance:changeme_secure_password@localhost:5672/"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Logging
    log_level: str = "INFO"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)
        self.log_file.parent.mkdir(parents=True, exist_ok=True)


settings = Settings()
