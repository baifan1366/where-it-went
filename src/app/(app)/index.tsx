import { format } from 'date-fns';
import React, { useCallback,useEffect, useState } from 'react';
import { Image,ScrollView, Text, TouchableOpacity,View } from 'react-native';
import { Button, Chip, Dialog, List, Portal } from 'react-native-paper';

import useFinanceStore from '@/core/hooks/use-finance-store';
import { type Category, type Transaction } from '@/types';

export default function TransactionDetailPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});

  const { getTransactionsByUserId, getCategoryByCategoryId } = useFinanceStore();

  const fetchTransactions = useCallback(async () => {
    try {
      const userId = '16d34515-f8c9-466f-acdb-34700deb1214'; // Replace with actual user ID
      const allTransactions = await getTransactionsByUserId(userId);
      const filteredTransactions = allTransactions.filter((transaction: Transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === selectedMonth.getMonth() &&
          transactionDate.getFullYear() === selectedMonth.getFullYear() &&
          (selectedCategories.length === 0 || (transaction.category_id && selectedCategories.some(category => category.id === transaction.category_id)))
        );
      });
      setTransactions(filteredTransactions);
      calculateMonthTotal(filteredTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [selectedMonth, selectedCategories, getTransactionsByUserId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const calculateMonthTotal = (transactions: Transaction[]) => {
    const total = transactions.reduce((sum, transaction) => {
      return transaction.type === 'expense' ? sum - transaction.amount : sum + transaction.amount;
    }, 0);
    setMonthTotal(total);
  };

  const handleMonthChange = (increment: number) => {
    setSelectedMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + increment);
      return newMonth;
    });
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prevCategories => {
      const exists = prevCategories.some(category => category.id === categoryId);
      if (exists) {
        return prevCategories.filter(category => category.id !== categoryId);
      } else {
        return [...prevCategories, { id: categoryId } as Category];
      }
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      const categoryMap: Record<string, Category> = {};
      for (const transaction of transactions) {
        if (transaction.category_id && !categoryMap[transaction.category_id]) {
          categoryMap[transaction.category_id] = await getCategoryByCategoryId(transaction.category_id);
        }
      }
      setCategories(categoryMap);
    };
    loadCategories();
  }, [transactions, getCategoryByCategoryId]);

  return (
    <ScrollView className="flex-1 bg-yellow-100">
      <View className="p-4">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => handleMonthChange(-1)}>
            <Text className="text-blue-500">Previous</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">
            {format(selectedMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity onPress={() => handleMonthChange(1)}>
            <Text className="text-blue-500">Next</Text>
          </TouchableOpacity>
        </View>
        <Text className="mb-4 text-xl font-bold">
          Total: {monthTotal.toFixed(2)}
        </Text>
        <Button
          mode="outlined"
          onPress={() => setFilterDialogVisible(true)}
          className="mb-4"
        >
          Filter Categories
        </Button>
        {transactions.map(transaction => {
          const category = transaction.category_id ? categories[transaction.category_id] : null;
          return (
            <List.Item
              key={transaction.id}
              title={transaction.description}
              description={`${transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}`}
              left={() => (
                category && category.icon ? (
                  <Image 
                    source={{ uri: category.icon }} 
                    style={{ width: 24, height: 24 }} 
                    className="mr-2"
                  />
                ) : (
                  <Text className="mr-2 text-2xl">{'📁'}</Text>
                )
              )}
              className="mb-2 rounded-lg bg-white p-2"
            />
          );
        })}
      </View>
      <Portal>
        <Dialog visible={filterDialogVisible} onDismiss={() => setFilterDialogVisible(false)}>
          <Dialog.Title>Filter Categories</Dialog.Title>
          <Dialog.Content>
            <View className="flex-row flex-wrap">
              {Object.entries(categories).map(([categoryId, category]) => (
                <Chip
                  key={categoryId}
                  selected={selectedCategories.some(c => c.id === categoryId)}
                  onPress={() => toggleCategoryFilter(categoryId)}
                  className="m-1"
                >
                  {category.icon}{category.name}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFilterDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
