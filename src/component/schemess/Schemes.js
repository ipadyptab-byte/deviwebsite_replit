import React from 'react';
import './Schemes.scss';

const schemesData = [
  {
    title: "Suvarna Dhanasanchya Yojna",
    description: "This scheme is an investment plan where a customer is supposed to invest Rs. 1000/- at start followed by Rs. 500/- per month for 12 months (1 year). On 13th month immediately after an year is completed, customers can use the money that they deposited over the last 12 months to buy jewellery of their choice that amounts to the deposited amount."
  },
  {
    title: "Suvarna Vruddhi Yojna",
    description: "According to this scheme, customers can pay any amount of money to purchase Gold. The purchases can even be made everyday until one year is completed. After an year, in 13th month, customer's will receive the purchased Gold jewellery with 9% interest on it."
  },
  {
    title: "Suvarna Kalash Yojna",
    description: "In this scheme, customers should at least deposit 25 gram pure Gold or Gold jewellery to us. After an year, customers will receive their gold/jewellery with 3% interest added in form of Gold. Customers can profit through both the interest on gold and global increase in gold rate."
  },
  {
    title: "Dhan Vruddhi Yojna",
    description: "Customers can invest their money in form of cash which will be repaid after an year with 3% interest added to it."
  },
  {
    title: "Sampoorna Bharat Bachat Yojna",
    description: "Customers can bring their old gold jewellery which they don’t use or which is not in a good condition, and deposit it to us for Ten Months after which they can buy any branded Gold jewellery from Devi jewellers with its hallmark HUID (by order or ready) and get 75% Labour costs Free on it."
  }
];

const Schemess = () => {
  return (
    <section className="schemes">
      <h2>Explore Available Schemes</h2>
      <div className="schemes-container">
        {schemesData.map((scheme, index) => (
          <div className="scheme-card" key={index}>
            <h3>{scheme.title}</h3>
            <p>{scheme.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Schemess;
