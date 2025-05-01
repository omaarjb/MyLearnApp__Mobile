export const getGradeColor = (grade) => {
    switch (grade) {
      case "A": return "#4CAF50"; // Green
      case "B": return "#2196F3"; // Blue
      case "C": return "#FFC107"; // Yellow
      case "D": return "#FF9800"; // Orange
      case "F": return "#F44336"; // Red
      default: return "#6C47FF"; // Default purple
    }
  };
  
  export const getRandomColor = (index) => {
    const colors = [
      "#6C47FF", "#4CAF50", "#2196F3", "#FFC107", 
      "#FF9800", "#F44336", "#9C27B0", "#3F51B5"
    ];
    return colors[index % colors.length];
  };
  
  export const getGradeFromScore = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  
  export const getCategoryDistribution = (attempts) => {
    const categories = {};
    
    attempts.forEach(attempt => {
      const topic = attempt.topic || "non-catégorisé";
      
      if (!categories[topic]) {
        categories[topic] = {
          name: topic,
          count: 0,
        };
      }
      
      categories[topic].count++;
    });
    
    return Object.values(categories).sort((a, b) => b.count - a.count);
  };