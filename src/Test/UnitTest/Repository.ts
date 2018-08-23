import {expect} from "chai";

import {Base} from "../../Annotator/Infrastructure/Repository";
import Repository = Base.Repository;

describe('Repository', () => {
    class DumbRepositoryRoot {

    }

    const dumbRepositoryRoot = new DumbRepositoryRoot();

    it('可添加', () => {
        const testRepo = new Repository<number>(dumbRepositoryRoot);
        const id = testRepo.add(42);
        expect(testRepo.has(id)).true;
        expect(testRepo.get(id)).equals(42);
    });
    it('可修改', () => {
        const testRepo = new Repository<number>(dumbRepositoryRoot);
        const id = testRepo.add(42);
        testRepo.set(id, 43);
        expect(testRepo.get(id)).equals(43);
    });
    it('可删除', () => {
        const testRepo = new Repository<number>(dumbRepositoryRoot);
        const id = testRepo.add(42);
        testRepo.delete(id);
        expect(testRepo.get(id)).throws;
    });
    it('可迭代', () => {
        const testRepo = new Repository<number>(dumbRepositoryRoot);
        testRepo.add(4);
        testRepo.add(5);
        testRepo.add(6);
        for (const [id, value] of testRepo) {
            expect([0, 1, 2]).contains(id);
            expect([4, 5, 6]).contains(value);
        }
    });
});