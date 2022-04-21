namespace QuizSystems.Models
{
    public class WebData
    {
        public int WebDataId { get; set; }
        public string WebDataHead { get; set; }
        public string WebDataContent { get; set; }

        public int QuizId { get; set; }
        public OnlineExam OnlineExam { get; set; }
    }
}
