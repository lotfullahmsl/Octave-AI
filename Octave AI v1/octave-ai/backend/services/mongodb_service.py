"""
MongoDB Atlas connection and data management
"""
import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from typing import Dict, List, Any, Optional
from datetime import datetime

class MongoDBService:
    def __init__(self):
        self.client = None
        self.db = None
        self.connected = False
        
        # Initialize connection
        self._connect()
    
    def _connect(self):
        """Connect to MongoDB Atlas"""
        try:
            mongodb_uri = os.getenv('MONGODB_URI')
            
            if not mongodb_uri:
                logging.warning("MongoDB URI not found in environment variables")
                return
            
            # Create client with timeout settings
            self.client = MongoClient(
                mongodb_uri,
                serverSelectionTimeoutMS=5000,  # 5 second timeout
                connectTimeoutMS=10000,         # 10 second connection timeout
                maxPoolSize=10
            )
            
            # Test connection
            self.client.admin.command('ping')
            
            # Get database
            self.db = self.client['octave-ai']
            
            self.connected = True
            logging.info("Successfully connected to MongoDB Atlas")
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logging.error(f"Failed to connect to MongoDB: {str(e)}")
            self.connected = False
        except Exception as e:
            logging.error(f"Unexpected error connecting to MongoDB: {str(e)}")
            self.connected = False
    
    def store_project(self, project_data: Dict[str, Any]) -> Optional[str]:
        """
        Store project data in the database
        """
        try:
            if not self.connected:
                logging.warning("MongoDB not connected, skipping storage")
                return None
            
            # Add timestamp
            project_data['created_at'] = datetime.utcnow()
            project_data['updated_at'] = datetime.utcnow()
            
            # Insert into projects collection
            result = self.db.projects.insert_one(project_data)
            
            logging.info(f"Stored project with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logging.error(f"Error storing project: {str(e)}")
            return None
    
    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve project by ID
        """
        try:
            if not self.connected:
                return None
            
            from bson import ObjectId
            project = self.db.projects.find_one({"_id": ObjectId(project_id)})
            
            if project:
                project['_id'] = str(project['_id'])
                return project
            
            return None
            
        except Exception as e:
            logging.error(f"Error retrieving project: {str(e)}")
            return None
    
    def store_voice_generation(self, generation_data: Dict[str, Any]) -> Optional[str]:
        """
        Store voice generation data
        """
        try:
            if not self.connected:
                return None
            
            generation_data['created_at'] = datetime.utcnow()
            
            result = self.db.voice_generations.insert_one(generation_data)
            
            logging.info(f"Stored voice generation with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logging.error(f"Error storing voice generation: {str(e)}")
            return None
    
    def get_user_projects(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent projects for a user
        """
        try:
            if not self.connected:
                return []
            
            projects = list(
                self.db.projects
                .find({"user_id": user_id})
                .sort("created_at", -1)
                .limit(limit)
            )
            
            # Convert ObjectId to string
            for project in projects:
                project['_id'] = str(project['_id'])
            
            return projects
            
        except Exception as e:
            logging.error(f"Error retrieving user projects: {str(e)}")
            return []
    
    def store_analytics_event(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        Store analytics/usage events
        """
        try:
            if not self.connected:
                return None
            
            event_data['timestamp'] = datetime.utcnow()
            
            result = self.db.analytics.insert_one(event_data)
            return str(result.inserted_id)
            
        except Exception as e:
            logging.error(f"Error storing analytics event: {str(e)}")
            return None
    
    def get_usage_stats(self, days: int = 30) -> Dict[str, Any]:
        """
        Get usage statistics for the last N days
        """
        try:
            if not self.connected:
                return {}
            
            from datetime import timedelta
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Aggregate usage data
            pipeline = [
                {"$match": {"created_at": {"$gte": start_date}}},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "projects_created": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]
            
            daily_stats = list(self.db.projects.aggregate(pipeline))
            
            # Get total counts
            total_projects = self.db.projects.count_documents({})
            total_generations = self.db.voice_generations.count_documents({})
            
            return {
                "daily_stats": daily_stats,
                "total_projects": total_projects,
                "total_generations": total_generations,
                "period_days": days
            }
            
        except Exception as e:
            logging.error(f"Error getting usage stats: {str(e)}")
            return {}
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check database health and connection status
        """
        try:
            if not self.connected:
                return {"status": "disconnected", "error": "Not connected to database"}
            
            # Test with a simple ping
            self.client.admin.command('ping')
            
            # Get collection counts
            projects_count = self.db.projects.count_documents({})
            generations_count = self.db.voice_generations.count_documents({})
            
            return {
                "status": "healthy",
                "connected": True,
                "projects_count": projects_count,
                "generations_count": generations_count,
                "database_name": self.db.name
            }
            
        except Exception as e:
            return {
                "status": "error",
                "connected": False,
                "error": str(e)
            }
    
    def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            self.connected = False
            logging.info("MongoDB connection closed")